"""
Decision-tree band estimator for the unified Wärmepumpe questionnaire.

Each leaf is a fully specified scenario with empirical EUR bands for device, installation,
and electrical/misc. Partial answers keep all leaves compatible with known fields; the
displayed range uses Option A: min of leaf minima and max of leaf maxima (per component
and for totals), then breakdown is scaled so component sums match the total band.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable

from app.calculators.waermepumpe.engine import (
    NEUTRAL_LABOR,
    _confidence_for_unknowns,
    _grant_range_eur,
    _safe_full_load_hours,
    _safe_price_index_factor,
    _unknown_count,
    low_temp_ready_for_risk,
    map_distribution_to_emitter,
    representative_living_area_m2,
)
from app.calculators.waermepumpe.schemas import (
    DhwChoice,
    DistributionType,
    EmitterType,
    EstimateBreakdown,
    EstimateResponse,
    HouseType,
    InsulationSurvey,
    LivingAreaBand,
    MoneyRange,
    SurveyHeating,
    UnifiedEstimateInput,
)
from app.calculators.waermepumpe.engine import ClimateRow, FundingRuleRow, HeatLoadRow, LaborRow


@dataclass(frozen=True)
class _Leaf:
    leaf_id: str
    house_type: HouseType
    living_area_band: LivingAreaBand
    current_heating: SurveyHeating
    distribution: DistributionType
    insulation: InsulationSurvey
    device_min: float
    device_max: float
    install_min: float
    install_max: float
    misc_min: float
    misc_max: float


def _all_leaves() -> tuple[_Leaf, ...]:
    """~30 typisierte Endknoten (Literatur / Projektspezifikation, netto übliche Spannen)."""
    HT = HouseType
    A = LivingAreaBand
    H = SurveyHeating
    D = DistributionType
    I = InsulationSurvey

    def L(
        lid: str,
        ht: HouseType,
        area: LivingAreaBand,
        heat: SurveyHeating,
        dist: DistributionType,
        ins: InsulationSurvey,
        dm: float,
        dM: float,
        im: float,
        iM: float,
        mm: float,
        mM: float,
    ) -> _Leaf:
        return _Leaf(
            leaf_id=lid,
            house_type=ht,
            living_area_band=area,
            current_heating=heat,
            distribution=dist,
            insulation=ins,
            device_min=dm,
            device_max=dM,
            install_min=im,
            install_max=iM,
            misc_min=mm,
            misc_max=mM,
        )

    return (
        # SFH klein
        L("sfh_u100_gas_floor", HT.SINGLE_FAMILY, A.UNDER_100, H.GAS, D.FLOOR, I.PARTLY_MODERN, 8200, 13500, 6200, 11000, 1900, 4500),
        L("sfh_u100_oil_radp", HT.SINGLE_FAMILY, A.UNDER_100, H.OIL, D.NORMAL_RADIATORS, I.NOT_RENOVATED, 9000, 14800, 9000, 15000, 2200, 5600),
        L("sfh_u100_es_floor", HT.SINGLE_FAMILY, A.UNDER_100, H.ELECTRIC_STORAGE, D.FLOOR, I.PARTLY_MODERN, 8000, 13200, 6000, 10800, 1850, 4400),
        L("sfh_u100_fw_mix", HT.SINGLE_FAMILY, A.UNDER_100, H.DISTRICT, D.MIXED, I.PARTLY_MODERN, 8500, 13800, 7200, 12500, 2000, 4800),
        # SFH 100–150
        L("sfh_100_gas_floor_g", HT.SINGLE_FAMILY, A.FROM_100_150, H.GAS, D.FLOOR, I.WELL_MODERN, 10000, 16000, 7000, 12500, 2000, 4800),
        # Häufige UI-Kombi (Fragebogen „teils modernisiert“ + Fußboden + Gas), vormals ohne Blatt → Fallback auf alle Szenarien
        L("sfh_100_gas_floor_avg", HT.SINGLE_FAMILY, A.FROM_100_150, H.GAS, D.FLOOR, I.PARTLY_MODERN, 10100, 16200, 7100, 12800, 2050, 5000),
        L("sfh_100_gas_rad_p", HT.SINGLE_FAMILY, A.FROM_100_150, H.GAS, D.NORMAL_RADIATORS, I.NOT_RENOVATED, 11000, 17500, 9000, 15000, 2300, 5500),
        L("sfh_100_oil_radl_p", HT.SINGLE_FAMILY, A.FROM_100_150, H.OIL, D.LARGE_RADIATORS, I.NOT_RENOVATED, 11800, 18800, 10500, 17200, 2400, 5800),
        L("sfh_100_es_mix", HT.SINGLE_FAMILY, A.FROM_100_150, H.ELECTRIC_STORAGE, D.MIXED, I.PARTLY_MODERN, 9800, 16200, 7800, 13800, 2050, 5000),
        L("sfh_100_fw_floor", HT.SINGLE_FAMILY, A.FROM_100_150, H.DISTRICT, D.FLOOR, I.PARTLY_MODERN, 10200, 16500, 7500, 13200, 2100, 5100),
        # SFH 150–200
        L("sfh_150_gas_floor", HT.SINGLE_FAMILY, A.FROM_150_200, H.GAS, D.FLOOR, I.PARTLY_MODERN, 11500, 18500, 8200, 14200, 2200, 5400),
        L("sfh_150_oil_rad_p", HT.SINGLE_FAMILY, A.FROM_150_200, H.OIL, D.NORMAL_RADIATORS, I.NOT_RENOVATED, 12500, 19800, 11000, 17500, 2450, 6000),
        L("sfh_150_es_floor", HT.SINGLE_FAMILY, A.FROM_150_200, H.ELECTRIC_STORAGE, D.FLOOR, I.WELL_MODERN, 10800, 17500, 7600, 13000, 2100, 5000),
        L("sfh_150_fw_mix", HT.SINGLE_FAMILY, A.FROM_150_200, H.DISTRICT, D.MIXED, I.PARTLY_MODERN, 11200, 17800, 8800, 14800, 2250, 5400),
        # SFH >200
        L("sfh_200p_gas_floor", HT.SINGLE_FAMILY, A.OVER_200, H.GAS, D.FLOOR, I.PARTLY_MODERN, 14000, 22000, 10000, 17500, 2500, 6200),
        L("sfh_200p_oil_radp", HT.SINGLE_FAMILY, A.OVER_200, H.OIL, D.NORMAL_RADIATORS, I.NOT_RENOVATED, 15200, 23800, 12000, 19500, 2700, 6600),
        # Duplex
        L("dup_100_gas_floor", HT.DUPLEX_ROW, A.FROM_100_150, H.GAS, D.FLOOR, I.PARTLY_MODERN, 9800, 15800, 6800, 12200, 2000, 4800),
        L("dup_100_oil_rad", HT.DUPLEX_ROW, A.FROM_100_150, H.OIL, D.NORMAL_RADIATORS, I.PARTLY_MODERN, 10500, 17200, 8800, 14800, 2150, 5200),
        L("dup_150_es_mix", HT.DUPLEX_ROW, A.FROM_150_200, H.ELECTRIC_STORAGE, D.MIXED, I.PARTLY_MODERN, 10200, 16800, 8000, 13800, 2100, 5100),
        # MFH
        L("mfh_150_gas_rad", HT.MULTI_FAMILY, A.FROM_150_200, H.GAS, D.NORMAL_RADIATORS, I.PARTLY_MODERN, 14500, 22000, 11000, 18500, 2600, 6500),
        L("mfh_200p_mix", HT.MULTI_FAMILY, A.OVER_200, H.GAS, D.MIXED, I.PARTLY_MODERN, 16000, 24000, 12000, 20000, 2800, 7000),
        L("mfh_200p_oil", HT.MULTI_FAMILY, A.OVER_200, H.OIL, D.NORMAL_RADIATORS, I.NOT_RENOVATED, 17000, 25500, 13500, 21500, 2900, 7200),
        # Ergänzende Verteilungen (gemischt / große HK)
        L("sfh_100_mixed_gas", HT.SINGLE_FAMILY, A.FROM_100_150, H.GAS, D.MIXED, I.PARTLY_MODERN, 10500, 17000, 8000, 14000, 2150, 5200),
        L("sfh_150_largeR_oil", HT.SINGLE_FAMILY, A.FROM_150_200, H.OIL, D.LARGE_RADIATORS, I.NOT_RENOVATED, 12800, 20200, 11200, 18200, 2500, 6000),
        L("sfh_u100_largeR_gas", HT.SINGLE_FAMILY, A.UNDER_100, H.GAS, D.LARGE_RADIATORS, I.NOT_RENOVATED, 9200, 15200, 9500, 15500, 2200, 5600),
        L("sfh_100_floor_poor", HT.SINGLE_FAMILY, A.FROM_100_150, H.GAS, D.FLOOR, I.NOT_RENOVATED, 10800, 17200, 8200, 13800, 2200, 5400),
        L("sfh_150_dist_floor", HT.SINGLE_FAMILY, A.FROM_150_200, H.DISTRICT, D.FLOOR, I.WELL_MODERN, 11800, 18800, 8600, 14500, 2300, 5600),
        L("dup_u100_gas", HT.DUPLEX_ROW, A.UNDER_100, H.GAS, D.FLOOR, I.PARTLY_MODERN, 8000, 13200, 6200, 10800, 1900, 4600),
        L("mfh_100_150_fw", HT.MULTI_FAMILY, A.FROM_100_150, H.DISTRICT, D.FLOOR, I.PARTLY_MODERN, 13500, 20500, 10200, 16800, 2500, 6300),
        L("mfh_100_150_gas_floor", HT.MULTI_FAMILY, A.FROM_100_150, H.GAS, D.FLOOR, I.PARTLY_MODERN, 13200, 20000, 10000, 16500, 2450, 6200),
        L("mfh_u100_gas_floor", HT.MULTI_FAMILY, A.UNDER_100, H.GAS, D.FLOOR, I.PARTLY_MODERN, 12000, 18800, 9000, 15200, 2300, 5800),
    )


_LEAVES = _all_leaves()

# Wenn keine Zeile passt: keine „Vereinigung aller Blätter“ (zu breit / wirkt unseriös).
_FALLBACK_LEAF_IDS: frozenset[str] = frozenset(
    {
        "sfh_100_gas_floor_avg",
        "sfh_150_gas_floor",
        "sfh_200p_gas_floor",
        "dup_100_gas_floor",
        "mfh_150_gas_rad",
        "mfh_100_150_gas_floor",
        "sfh_100_gas_rad_p",
        "sfh_u100_gas_floor",
    }
)


def _fallback_leaves() -> list[_Leaf]:
    return [leaf for leaf in _LEAVES if leaf.leaf_id in _FALLBACK_LEAF_IDS]


def _field_match_enum[T](user: T | None, leaf_val: T, unknown: T) -> bool:
    """Frontend „Weiß nicht“ sendet explizites *UNKNOWN-Enum — wie fehlendes Feld (Wildcard)."""
    if user is None or user == unknown:
        return True
    return user == leaf_val


def _compatible_leaves(inp: UnifiedEstimateInput) -> list[_Leaf]:
    out: list[_Leaf] = []
    for leaf in _LEAVES:
        if not _field_match_enum(inp.house_type, leaf.house_type, HouseType.UNKNOWN):
            continue
        if not _field_match_enum(inp.living_area_band, leaf.living_area_band, LivingAreaBand.UNKNOWN):
            continue
        if not _field_match_enum(inp.current_heating, leaf.current_heating, SurveyHeating.UNKNOWN):
            continue
        if not _field_match_enum(inp.distribution, leaf.distribution, DistributionType.UNKNOWN):
            continue
        if not _field_match_enum(inp.insulation, leaf.insulation, InsulationSurvey.UNKNOWN):
            continue
        out.append(leaf)
    return out


def _option_a_range(values: Iterable[tuple[float, float]]) -> tuple[float, float]:
    pairs = list(values)
    if not pairs:
        return 0.0, 0.0
    lo = min(a for a, _ in pairs)
    hi = max(b for _, b in pairs)
    return lo, hi


def _dhw_misc_adjustment(dhw: DhwChoice | None) -> tuple[float, float]:
    """Skaliert Misc leicht nach Warmwasser (kein separates Blatt-Explosion)."""
    if dhw is None or dhw == DhwChoice.UNKNOWN:
        return 1.0, 1.0
    if dhw == DhwChoice.YES:
        return 1.0, 1.0
    # kein / wenig WW: untere Kante etwas niedriger
    return 0.92, 0.95


def _labor_price_scale(labor: LaborRow) -> float:
    if labor.region_code == NEUTRAL_LABOR.region_code:
        return 1.0
    mid = 0.5 * (labor.labor_factor_min + labor.labor_factor_max)
    # leichte Regionalabweichung um ±4 % um 1.0
    return max(0.92, min(1.08, 0.96 + 0.04 * mid))


def _funding_pct_range_pct(inp: UnifiedEstimateInput) -> tuple[float, float]:
    """
    Förder-Prozentband (0–100) für BEG-ähnliche Logik: Basis + ggf. Austauschbonus.
    Ohne Einkommensangabe: konservatives breites Band bei unbekannter Heizung.
    """
    h = inp.current_heating
    if h is None or h == SurveyHeating.UNKNOWN:
        return 30.0, 70.0
    if h in (SurveyHeating.GAS, SurveyHeating.OIL, SurveyHeating.ELECTRIC_STORAGE):
        return 50.0, 70.0
    if h == SurveyHeating.DISTRICT:
        return 30.0, 52.0
    return 30.0, 70.0


def _effective_grant_pct_range(inp: UnifiedEstimateInput, funding: FundingRuleRow) -> tuple[float, float]:
    """Szenario-Band mit Admin-DB überschneiden; bei leerer Schnittmenge gilt die DB-Kalibrierung."""
    s_lo, s_hi = _funding_pct_range_pct(inp)
    d_lo, d_hi = float(funding.grant_pct_min), float(funding.grant_pct_max)
    if d_lo > d_hi:
        d_lo, d_hi = d_hi, d_lo
    if s_lo > s_hi:
        s_lo, s_hi = s_hi, s_lo
    eff_lo = max(s_lo, d_lo)
    eff_hi = min(s_hi, d_hi)
    if eff_lo <= eff_hi:
        return eff_lo, eff_hi
    return d_lo, d_hi


def _thermal_kw_band(inp: UnifiedEstimateInput, heat: HeatLoadRow, climate: ClimateRow, full_load_hours: float) -> MoneyRange:
    """Leichtgewichtiger Proxy konsistent zur alten Engine (Transparenz)."""
    flh = _safe_full_load_hours(full_load_hours)
    area = representative_living_area_m2(inp.living_area_band)
    f_climate = climate.heating_degree_factor
    iq = inp.insulation
    if iq == InsulationSurvey.NOT_RENOVATED:
        lo_f, hi_f = 1.08, 1.12
    elif iq == InsulationSurvey.WELL_MODERN:
        lo_f, hi_f = 0.88, 0.92
    elif iq == InsulationSurvey.PARTLY_MODERN:
        lo_f, hi_f = 1.0, 1.0
    else:
        lo_f, hi_f = 1.0, 1.0
    # Nutze heat-Band aus DB-Zeile (default), skaliert mit Dämmung
    sp_min = heat.specific_demand_kwh_m2a_min * f_climate * lo_f
    sp_max = heat.specific_demand_kwh_m2a_max * f_climate * hi_f
    space_kwh_min = area * sp_min
    space_kwh_max = area * sp_max
    kw_min = space_kwh_min / max(flh, 500.0)
    kw_max = space_kwh_max / max(flh, 500.0)
    return MoneyRange(min=round(kw_min, 2), max=round(kw_max, 2))


def estimate_unified_decision_tree(
    inp: UnifiedEstimateInput,
    *,
    climate: ClimateRow,
    heat_base: HeatLoadRow,
    funding: FundingRuleRow,
    labor: LaborRow,
    price_index_factor: float = 1.0,
    full_load_hours: float = 2000.0,
    rule_set_version: str = "",
) -> EstimateResponse:
    matched_leaves = _compatible_leaves(inp)
    used_leaf_fallback = len(matched_leaves) == 0
    if matched_leaves:
        leaves = matched_leaves
    else:
        leaves = _fallback_leaves()

    f_idx = _safe_price_index_factor(price_index_factor)
    lab = _labor_price_scale(labor)
    dhw_lo, dhw_hi = _dhw_misc_adjustment(inp.dhw)

    scaled: list[tuple[float, float, float, float, float, float]] = []
    for leaf in leaves:
        dm, dM = leaf.device_min * f_idx * lab, leaf.device_max * f_idx * lab
        im, iM = leaf.install_min * f_idx * lab, leaf.install_max * f_idx * lab
        mm = leaf.misc_min * dhw_lo
        mM = leaf.misc_max * dhw_hi
        scaled.append((dm, dM, im, iM, mm, mM))

    dev_lo, dev_hi = _option_a_range((s[0], s[1]) for s in scaled)
    ins_lo, ins_hi = _option_a_range((s[2], s[3]) for s in scaled)
    misc_lo, misc_hi = _option_a_range((s[4], s[5]) for s in scaled)

    sum_lo = dev_lo + ins_lo + misc_lo
    sum_hi = dev_hi + ins_hi + misc_hi

    tot_lo = min(s[0] + s[2] + s[4] for s in scaled)
    tot_hi = max(s[1] + s[3] + s[5] for s in scaled)

    if sum_lo > 0 and tot_lo > 0:
        f_lo = tot_lo / sum_lo
        dev_lo *= f_lo
        ins_lo *= f_lo
        misc_lo *= f_lo
    if sum_hi > 0 and tot_hi > 0:
        f_hi = tot_hi / sum_hi
        dev_hi *= f_hi
        ins_hi *= f_hi
        misc_hi *= f_hi

    warnings: list[str] = []
    if used_leaf_fallback:
        warnings.append(
            "Keine exakte Zeile zur Kombination — es wird eine kompakte Referenzgruppe "
            f"({len(leaves)} typische Szenarien) statt der gesamten Datenbasis genutzt."
        )
    if f_idx != price_index_factor and math.isfinite(price_index_factor):
        warnings.append("Preisindex-Faktor ungültig oder außerhalb 0.5–2.0; Wert wurde angepasst.")
    elif not math.isfinite(price_index_factor) or price_index_factor <= 0:
        warnings.append("Preisindex-Faktor ungültig; es wird 1.0 verwendet.")

    pct_lo, pct_hi = _effective_grant_pct_range(inp, funding)

    # Förderung und Eigenanteil **pro Blatt** rechnen, dann aggregieren — verhindert
    # unrealistische 0 € unten (Aggregat-minus-Max-Förderung über verschiedene Projekthöhen).
    grant_mins: list[float] = []
    grant_maxs: list[float] = []
    net_mins: list[float] = []
    net_maxs: list[float] = []
    for s in scaled:
        t_lo = s[0] + s[2] + s[4]
        t_hi = s[1] + s[3] + s[5]
        g_lo, g_hi = _grant_range_eur(
            t_lo,
            t_hi,
            pct_lo,
            pct_hi,
            funding.grant_eur_cap_max,
            warnings=None,
        )
        grant_mins.append(g_lo)
        grant_maxs.append(g_hi)
        net_mins.append(max(0.0, t_lo - g_hi))
        net_maxs.append(max(0.0, t_hi - g_lo))

    grant_min_eur = min(grant_mins) if grant_mins else 0.0
    grant_max_eur = max(grant_maxs) if grant_maxs else 0.0
    net_min = min(net_mins) if net_mins else 0.0
    net_max = max(net_maxs) if net_maxs else 0.0

    # Sicherheitsband: keine 0 € Untergrenze bei noch plausiblen Restkosten (Anzeige)
    MIN_NET_AFTER_EUR = 800.0
    if net_max > 0 and net_min < MIN_NET_AFTER_EUR:
        net_min = MIN_NET_AFTER_EUR
    if net_max < net_min:
        net_max = net_min

    emitter, _ = map_distribution_to_emitter(inp.distribution)
    flags: list[str] = []
    if emitter == EmitterType.RADIATORS and not low_temp_ready_for_risk(inp.low_temp_readiness):
        flags.append("risk_high_flow_temp")

    th = _thermal_kw_band(inp, heat_base, climate, full_load_hours)

    assumptions = [
        "Entscheidungsbaum mit typisierten Kostenspannen je Szenario (Gerät, Installation, Elektrik/Sonstiges); "
        "Markt- und Literaturdaten, keine Vor-Ort-Begehung.",
        "Teilantworten: es werden alle noch passenden Szenarien berücksichtigt; die Spanne ist die Vereinigung (Minimum der Untergrenzen, Maximum der Obergrenzen).",
        "Förderung als Band gemäß konfigurierter Prozentsätze und Obergrenze (Admin/Referenz), angelehnt an gängige BEG-Bonuslogik; keine Rechtsberatung.",
        "Netto-Kosten ohne MwSt.; regionale Montage/Klima nur als leichte Skalierung über Referenzfaktoren.",
    ]

    conf = _confidence_for_unknowns(_unknown_count(inp))

    sizing_notes = [
        f"Thermischer Leistungs-Proxy (Jahresmittel): {th.min:.2f}–{th.max:.2f} kW.",
        f"Aktive Baum-Szenarien: {len(leaves)} von {len(_LEAVES)}"
        + (" (Fallback: kompakte Referenzgruppe)" if used_leaf_fallback else ""),
    ]
    if f_idx != 1.0:
        sizing_notes.append(f"Preisindex-Faktor auf Gerät+Montage: {f_idx:.3f}.")

    return EstimateResponse(
        stage=1,
        rule_set_version=rule_set_version,
        estimated_thermal_kw_band=th,
        sizing_notes=sizing_notes,
        total_net_before_funding=MoneyRange(min=round(tot_lo, 2), max=round(tot_hi, 2)),
        funding_grant=MoneyRange(min=round(grant_min_eur, 2), max=round(grant_max_eur, 2)),
        total_net_after_funding=MoneyRange(min=round(net_min, 2), max=round(net_max, 2)),
        breakdown=EstimateBreakdown(
            heat_pump_device=MoneyRange(min=round(dev_lo, 2), max=round(dev_hi, 2)),
            installation=MoneyRange(min=round(ins_lo, 2), max=round(ins_hi, 2)),
            electrical_and_misc=MoneyRange(min=round(misc_lo, 2), max=round(misc_hi, 2)),
        ),
        assumptions=assumptions,
        confidence=conf,
        warnings=warnings,
        flags=flags,
    )
