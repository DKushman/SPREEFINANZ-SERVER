<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html lang="de" class="module_login moduleaction_sendpassword  backendmenu_modern">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>digidor</title>
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="description" content="Hier gelangen Sie zur Administrations-Oberfl&auml;che von digidor" >

<link href="styles/digidorclean/main.css?v=8bac4c10" rel="stylesheet" charset="utf-8">


	<meta name="viewport" content="width=1050">
	

<link rel="apple-touch-icon" sizes="180x180" href="/content/icons/favicons/digidor/apple-touch-icon.png"><link rel="icon" type="image/svg+xml" sizes="any" href="/content/icons/favicons/digidor/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/content/icons/favicons/digidor/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/content/icons/favicons/digidor/favicon-16x16.png"><link rel="manifest" href="/content/icons/favicons/digidor/site.webmanifest"><link rel="mask-icon" href="/content/icons/favicons/digidor/safari-pinned-tab.svg" color="#112935"><meta name="theme-color" content="#112935">
<script language="javascript">
	var alertFallback = false;
	if (typeof console === "undefined" || typeof console.log === "undefined") {
		console = {};
		if (alertFallback) {
			console.log = function(msg) {
				alert(msg);
			};
		} 
		else {
			console.log = function() {};
		}
	}
</script>

<script src="/include/bootstrap.min.js"></script><script src="/include/jquery/jquery-1.11.3.min.js?v=88947705"></script><script src="/include/jquery/jquery-migrate-1.4.1.min.js?v=1f8599e6"></script><script src="/include/jquery/jquery-ui-1.11.4.custom/jquery-ui.min.js?v=dd2e146c"></script><script src="/include/jquery/jquery-ui-1.11.4.custom/datepicker-de.js?v=bbe23842"></script><script src="/include/js/thirdparty/moment-with-locales.2.29.4.min.js?v=d6582475"></script><script src="/include/jquery/datatables/datatables.min.js?v=c4b7a7b5"></script><script src="/include/jquery/datatables/plug-ins/1.10.22/sorting/datetime-moment.js?v=4e7e73d0"></script><script src="/include/tinymce5/tinymce.min.js?v=464f2259"></script><script src="/include/tinymce5/jquery.tinymce.min.js?v=d005e695"></script><script src="/include/js/min/backend.min.js?v=673492c9"></script>
<link rel="stylesheet" media="screen" href="/include/jquery/jquery-ui-1.11.4.custom/themes/smoothness/jquery-ui.min.css" />
<link rel="stylesheet" media="screen" href="/include/introjs-2.9.3/intro.css" />
<link rel="stylesheet" media="screen" href="/include/jquery/datatables/datatables.min.css" />
<link rel="stylesheet" media="screen" href="/include/jquery/jquery-ui-eh-overwrite.css" />
<link rel="stylesheet" href="/include/jquery/tagedit/css/jquery.tagedit.css" media="screen">

<script language="javascript">
	
digidor.editmode.initConnection( 'https://config.digidor.de' );
digidor.challengeToken.next( 'challenge_token=c7d6c793b138cd30ced4f2fa955ab3bd13104365fa3236890b' );

var nolock = 0;
var msgshown = 0;
var lock = 0;
var hash = window.location.hash.replace( '#', '' );

var tinymce_ehplaceholder_userlabel;
function doNothing()
{
	return true;
}

function scrollParent(x,y,speed)
{
	if ( $("#editframe").length > 0 ) { var editframePos = $('#editframe').offset(); var addOffset = editframePos.top; }
	else var addOffset = 0;

	$.scrollTo( {top: (y+addOffset)+'px', left: x+'px'}, speed );
}

function pkgAlert(feature)
{
	featuretext = '';
	if (feature == 'seo') featuretext = 'Die Einstellungen zur Suchmaschinenoptimierung bieten Ihnen Möglichkeiten, Ihre Seite im Internet leichter auffindbar zu machen. Neben der Eintragung Ihrer Seite in den wichtigsten Suchmaschinen können Sie META-Tags definieren und erhalten ausführliche Informationen, mit welchen Maßnahmen Sie Ihre Seite weiter optimieren können.';
	if (feature == 'socialmedia') featuretext = 'Das Social Media Modul erm&ouml;glicht Ihnen, Ihre Homepage mit Sozialen Netzwerken wie Facebook, Twitter oder XING zu verkn&uuml;pfen. Das er&ouml;ffnet ganz neue M&ouml;glichkeiten im Emfehlungsmarketing.';
	if (feature == 'forms') featuretext = 'Mit dem Formular-Editor k&ouml;nnen Sie ganz einfach Ihre eigenen Anfrageformulare erstellen. Die automatische Plausibilit&auml;tspr&uuml;fung stellt sicher, dass Ihre Formulare auch richtig ausgef&uuml;llt werden und z. B. im Abfrage-Feld \'E-Mail\' auch tats&auml;chlich eine E-Mail-Adresse angegeben wird.';
	if (feature == 'statistic') featuretext = 'Die Besucher-Statistik bietet Ihnen einen ausf&uuml;hrlichen &Uuml;berblick &uuml;ber die Besucherzahlen, wie die Besucher auf Ihre Seite gelangt sind, unter welchen Begriffen Ihre Seite in Suchmaschinen gefunden wird und vieles mehr.';
	if (feature == 'nl') featuretext = 'Mit dem Newsletter-Service können Sie E-Mail-Rundschreiben versenden. Interessierte Seitenbesucher registrieren sich auf Ihrer Homepage für diesen Service; wenn Sie einen Newsletter verschicken, wird die E-Mail automatisch an alle registrierten Nutzer verschickt - natürlich unter Berücksichtigung der gesetzlichen Regelungen E-Mail-Versand.';
	if (feature == 'rating') featuretext = 'Mit dem Bewertungs-Modul k&ouml;nnen Sie Referenzen Ihrer Kunden in Ihre Homepage einbinden.';
	if (feature == 'clients') featuretext = 'Mit der Funktion Kunden-Logins können Sie passwortgeschützte Seiten und Rubriken in Ihre Homepage einbinden und Benutzer-Logins anlegen. So können Sie z.B. Detailinformationen oder Downloads anbieten, die Ihren Kunden vorbehalten sind.';
	if (feature == 'elements') featuretext = 'Mit diesem Paket können Sie neue Inhalts-Elemente einfügen und Elemente verschiedener Typen beliebig miteinander kombinieren. Weiterhin können Sie alle redaktionellen Inhalte aus der Artikel-Bibliothek individuell bearbeiten.';
	if (feature == 'email') featuretext = 'Mit diesem Paket erhalten Sie Ihre eigene Domain (z.B. www.wunschname.de) und können beliebige E-Mail-Adressen (z.B. info@wunschname.de) einrichten.';
	if (feature == 'indicolor') featuretext = 'Mit diesem Paket können Ihre Homepage-Farben individuell anpassen.';
	if (feature == 'indiimage') featuretext = 'Mit der Premium-Homepage GOLD können Sie diese Design-Vorlage auswählen und mit Ihrer eigenen Kopfgrafik versehen.';
	if (feature == 'video') featuretext = 'Mit diesem Paket können Sie aus mehreren Farbvarianten für die Produktfilme wählen.';
	if (feature == 'menusidebar') featuretext = 'Mit diesem Paket können Sie hier Inhalte einfügen, die auf allen Unterseiten angezeigt werden. Sie können dieses Feld beispielsweise nutzen, um Ihre Kontaktdaten auf jeder Seite einzublenden.';
	if (feature == 'pages') featuretext = 'In der Premium-Homepage können neue Seiten enf&uuml;gen, das Men&uuml; sortieren und in bis zu 3 Ebenen gliedern.';

	if ((lock == 0) || (feature == 'indicolor') || (feature == 'indiimage') || (feature == 'video'))
	{
		if (featuretext != '') featuretext = '<p>'+featuretext+'</p>';
		if (0 == 2) var gold_add = 'GOLD';
		else if (0 == 6) var gold_add = 'expertenhomepage KLASSIK';
		else var gold_add = 'Premium';

		confirm('<img src="content/icons/icobig_upgrade.gif" class="icon"><div class="content" style="padding-left: 5px;"><p><strong>Dies ist eine '+gold_add+'-Funktion.</strong></p>'+featuretext+'<p>Möchten Sie jetzt mehr über das '+gold_add+' Paket erfahren?</p></div>','index.php?module=upgrade&action=eh_overview');
		return false;
	}
}

function pageUnloadMsg()
{
	var nlock = 0;
	
	if (nlock != 1)
	{
		alert('<img src="content/icons/icobig_warn.gif" class="icon"><div class="content" style="padding-left: 5px;"><p class="title">Speichern oder verwerfen!</p><p>Sie haben &Auml;nderungen vorgenommen. Bitte speichern oder verwerfen Sie diese zuerst.</p></div>');
		return false;
	}
}

function pagePreviewFormMsg()
{
	alert('<img src="content/icons/icobig_warn.gif" class="icon"><div class="content" style="padding-left: 5px;"><p class="title">Funktion hier nicht verf&uuml;gbar!</p><p>Im Berabeitungs-Modus ist die Funktion von Formularen und Rechnern eingeschr&auml;nkt. Bitte testen Sie diese direkt auf Ihrer Homepage.</p></div>');
	return false;
}

function topMenuLock( element, msg ) {
	
	if( 0 == nolock ) {
		
		$( document ).on( 'click', '#topmenu1, .topmenu1_minimized, #topmenu2, #li_logout, .lockonchange', msg );
		
		lock = 1;
		
		topMenuLock = function( element, msg ) {
			
			return false;
			
		}
		
	}
	
	return false;
	
}

function loadMsg(msg)
{
	if (msgshown == 0)
	{
		alert(msg);
		msgshown = 1;
	}
}

function getWinHeight()
{
	if (self.innerHeight)
	{
		return self.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientHeight)
	{
		return document.documentElement.clientHeight;
	}
	else if (document.body)
	{
		return document.body.clientHeight;
	}
}

function openStartscreen( start ) {
	
	digidor.overlay.open( '/modules/assistant/start.ajax.php?start=' + start, {
		customWidth: 850, 
		size: 'large',
		hideCloseButton: true,
	});
	
	return false;
	
}

function onboardingTutorialRearange() {
	
	setTimeout( function() {
		
		try {
			
			onboardingTutorialMicrosteps.refresh(); // intro.js-Hinweise richtig positionieren
		
		} catch( e ) {}
		
	}, 401 );
	
}


$(document).ready(function() {
	
	digidor.tooltip.init();
	
		
	/* Dropdown-Menü für Buttons */
	
	$( '.silver_button.with_menu, .silver_button_with_icon.with_menu, .cm_button.with_menu, .cm_button_with_icon.with_menu, .cm_actionbutton.with_menu, .cm_actionbutton_with_icon.with_menu, .cm_border_button.with_menu, .cm_border_button_with_icon.with_menu' ).on( 'click', function() {
		
		if( 0 == $( this ).siblings( '.button_menu:visible' ).length ) {
			
			$( this ).siblings( '.button_menu' ).width( $( this ).innerWidth() );
			$( this ).siblings( '.button_menu' ).slideDown( 'fast' );
			$( this ).css({ 
				'border-bottom-left-radius': 0,
				'border-bottom-right-radius': 0
			});			
		
		} else {

			$( this ).siblings( '.button_menu' ).slideUp( 'fast' );
			$( this ).css({ 
				'border-bottom-left-radius': '3px',
				'border-bottom-right-radius': '3px'
			});
		
		}
		
	});
	
	$( '.silver_button.with_menu, .silver_button_with_icon.with_menu, .cm_button.with_menu, .cm_button_with_icon.with_menu, .cm_actionbutton.with_menu, .cm_actionbutton_with_icon.with_menu, .cm_border_button.with_menu, .cm_border_button_with_icon.with_menu' ).siblings( '.button_menu' ).on( 'click', function() {
		
		$( this ).prev( '.silver_button.with_menu, .silver_button_with_icon.with_menu, .cm_button.with_menu, .cm_button_with_icon.with_menu, .cm_actionbutton.with_menu, .cm_actionbutton_with_icon.with_menu, .cm_border_button.with_menu, .cm_border_button_with_icon.with_menu' ).trigger( 'click' );

	});
	
	/* tro 24.8.21: Das wurde auskommentiert, da es im Zusammenspiel mit dem Popover-Menu_Settings (modules/digidorusers/digidorusers_management_active.inc.php) Probleme macht. Perspektivisch sollen voraussichtlich eh alle menu_settings auf Popovers umgebaut werden. 
	$( document ).mouseup( function( e ) {
			
		if( ! $( '.menu_settings' ).is( e.target ) && ! $( '.menu_settings' ).find( '*' ).is( e.target ) && ! $( '.menu_settings' ).prev().is( e.target ) && ! $( '.menu_settings' ).prev().find( '*' ).is( e.target ) ) {

			$( '.menu_settings' ).slideUp( 'fast' );
			
		} 
		
	});	
	*/
	
	if( 'digidoradventsgewinnspiel2019' == hash ) {
		
		digidor.util.removeHash();
		
		$( '#topmenu0' ).find( '.digidoradventsgewinnspiel' ).trigger( 'click' );
		
	}
			
});

function onAccountCreatorWizardChange( e ) {
	
		
	if( $( e.target ).parents( 'form' ).find( '#tf_desired_domain' ).length && ( ( $( e.target ).is( '[id="tf_firstname"]' ) && '' != $( e.target ).parents( 'form' ).find( '#tf_lastname' ).val() ) || ( $( e.target ).is( '[id="tf_lastname"]' ) && '' != $( e.target ).parents( 'form' ).find( '#tf_firstname' ).val() ) ) ) {
		
		$.ajax({
			async: true,
			type: "POST",
			url: '/tools/check_desired_domain.ajax.php',
			data: {
				task: 'suggest', 
				account_creator_template: $( e.target ).parents( 'form' ).find( '#hf_accountcreator_template' ).val(), 
				firstname: $( e.target ).parents( 'form' ).find( '#tf_firstname' ).val(),
				lastname: $( e.target ).parents( 'form' ).find( '#tf_lastname' ).val(), 
				desired_domain_compontent: $( e.target ).parents( 'form' ).find( '#tf_desired_domain' ).attr( 'data-accountcreator-desired-domain-compontent' )
			},
			
		}).always( function( response ) {
			
			var responseJSON = JSON.parse( response );

			if( responseJSON.success ) {
				
				$( e.target ).parents( 'form' ).find( '#tf_desired_domain' ).val( responseJSON.suggestion );
				$( e.target ).parents( 'form' ).find( '#tf_desired_domain' ).removeClass( 'error' ).removeAttr( 'data-accountcreator-error' );
				$( e.target ).parents( 'form' ).find( 'label[for="tf_desired_domain"]' ).parent().removeClass( 'error' );
			}
			
			if( 'function' === typeof onAccountCreatorWizardChangeCallback ) {
						
				onAccountCreatorWizardChangeCallback( e, responseJSON );
				
			}
			
		});
		
	} else if( $( e.target ).is( '[id="tf_desired_domain"]' ) ) {
					
		var desired_domain = $( e.target ).val();

		desired_domain = desired_domain.toLowerCase();
		
		desired_domain = desired_domain.replace(/é/g, "e");
		desired_domain = desired_domain.replace(/\u00e9/g, "e");
		desired_domain = desired_domain.replace(/&eacute;/g, "e");
		
		desired_domain = desired_domain.replace(/è/g, "e");
		desired_domain = desired_domain.replace(/\u00e8/g, "e");
		desired_domain = desired_domain.replace(/&egrave;/g, "e");
		
		desired_domain = desired_domain.replace(/ü/g, "ue");
		desired_domain = desired_domain.replace(/\u00fc/g, "ue");
		desired_domain = desired_domain.replace(/&uuml;/g, "ue");
		
		desired_domain = desired_domain.replace(/ö/g, "oe");
		desired_domain = desired_domain.replace(/\u00f6/g, "oe");
		desired_domain = desired_domain.replace(/&ouml;/g, "oe");
		
		desired_domain = desired_domain.replace(/ä/g, "ae");
		desired_domain = desired_domain.replace(/\u00e4/g, "ae");
		desired_domain = desired_domain.replace(/&auml;/g, "ae");
		
		desired_domain = desired_domain.replace(/ß/g, "ss");
		desired_domain = desired_domain.replace(/\u00df/g, "ss");
		desired_domain = desired_domain.replace(/&szlig;/g, "ss");
		
		desired_domain = desired_domain.replace(/ /g, "-");
		desired_domain = desired_domain.replace(/[^a-z0-9_-]/g, "");
		desired_domain = desired_domain.replace(/^[\-_]+|[\-_]+$/g, "");
		desired_domain = desired_domain.replace(/-{2,}/g, "-");
		desired_domain = desired_domain.replace(/_{2,}/g, "_");
		
		$( e.target ).val( desired_domain );
						
		$.ajax({
			async: true,
			type: "POST",
			url: '/tools/check_desired_domain.ajax.php',
			data: {
				task: 'check', 
				account_creator_template: $( e.target ).parents( 'form' ).find( '#hf_accountcreator_template' ).val(), 
				desired_domain: $( e.target ).val()
			},
			
		}).always( function( response ) {
			
			var responseJSON = JSON.parse( response );

			if( ! responseJSON.success ) {
				
				$( e.target ).addClass( 'error' ).attr( 'data-accountcreator-error', 'true' );
				$( e.target ).parents( 'form' ).find( 'label[for="tf_desired_domain"]' ).parent().addClass( 'error' );
				
			} else {
				
				$( e.target ).removeClass( 'error' ).removeAttr( 'data-accountcreator-error' );
				$( e.target ).parents( 'form' ).find( 'label[for="tf_desired_domain"]' ).parent().removeClass( 'error' );
				
			}
			
			if( 'function' === typeof onAccountCreatorWizardChangeCallback ) {
						
				onAccountCreatorWizardChangeCallback( e, responseJSON );
				
			}
			
		});	
		
	}
	
}

</script>

</head>


<body >
<div id="systemcontainer"  class="small_top">


<div class="cont_header" data-fixed-menubar-offset="relevant">
	
	<div class="systemlogo">
		
		<div id="bt_toggle_backendmenu"></div>
		
		<div class="menuitem_label">
					</div>
		
		<div class="menu_systemlogo"><a href="index.php"><img src="/styles/digidorclean/syslogo_inv.svg?v=f09bd3f6" alt="Logo" /></a></div>		
	</div>
	
</div>

<div class="cont_main"><!-- include modules start -->
<script>

$( document ).ready( function() {
	
	$( '#form_sendpassword' ).on( 'submit', function() {
		
		var error = false;
		
		if( '' == $( '#tf_user' ).val() ) {
			
			error = true;
			
			$( '#tf_user' ).addClass( 'error' );
			
		} else {
			
			$( '#tf_user' ).removeClass( 'error' );
			
		}
		
		if( '' == $( '#tf_email' ).val() ) {
			
			error = true;
			
			$( '#tf_email' ).addClass( 'error' );
			
		} else {
			
			$( '#tf_email' ).removeClass( 'error' );
			
		}
		
		if( false === error && digidor.login.isFriendlyCaptchaReady() ) {
			
			digidor.wait.show();
			
		} else {
			
			return false;
			
		}
		
	});
	
}); 

</script>

<form class="use-bootstrap-v5" id="form_sendpassword" method="post" style="margin: 100px auto 120px; max-width: 420px; width: 100%;" action="index.php?module=login&action=sendpassword&step=1&noout=1">
 
	<h1 class="h4">Passwort zur&uuml;cksetzen</h1>

	<div class="form-group pt-3">
		<label class="pb-1" for="tf_user">Ihr Benutzername:</label>
		<input type="text" class="form-control form-control-sm" id="tf_user" name="tf_user">
	</div>
	
	<div class="form-group pt-3">
		<label class="pb-1" for="tf_email">Ihre E-Mail-Adresse:</label>
		<input type="text" class="form-control form-control-sm" id="tf_email" name="tf_email">
	</div>
	
	<div class="frc-captcha" data-sitekey="FCMSEQPNJPJHTKAA" data-lang="de" data-start="focus" data-puzzle-endpoint="https://eu-api.friendlycaptcha.eu/api/v1/puzzle"></div>	
	<button type="submit" class="btn btn-sm cm_actionbutton float-end">Passwort zur&uuml;cksetzen</button>
	

</form>



	
<!-- include modules end --></div>
<div id="footercontainer">
	<div class="footer_content">
	<span>&copy; <a href="https://www.digidor.de" target="_blank">digidor GmbH</a></span>	</div>
</div>
  
</div>


<div class="use-bootstrap-v5">
	<div id="modalContainer"></div>
</div>

<script>
	
	var globalOrderLink = 'index.php?module=upgrade&step=2&pkg=0&lock=no';
    digidor.backend.init( 'login', 'sendpassword', '' );
	
</script>

<div class="use-bootstrap-v5" id="global_bootstrap_container"></div>


<script src="https://cdn.digidor.de/content/js/minified.js.php?user=-1&landingpage=0&data=W3sidCI6MSwiaSI6LTEsInAiOltdLCJjIjoiNzU2YzFjNTkifV0%3D" charset="UTF-8" ></script><script src="https://cdn.digidor.de/content/js/minified.js.php?user=-1&landingpage=0&data=W3sidCI6MSwiaSI6MjQsInAiOltdLCJjIjoiNzM4ZjcyYTEifV0%3D" charset="UTF-8" ></script>
</body>



<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/">
	<defs>
		<linearGradient id="tinymce_ai_gradient" x1="1000%" y1="0%" x2="0%" y2="100%"> 
			<stop offset="0%" stop-color="#58A9C2">
				<animate attributeName="stop-color" values="#58A9C2; #93C258; #0F5A85; #793659; #58A9C2" dur="15s" repeatCount="indefinite" />
			</stop>
			<stop offset="25%" stop-color="#93C258">
				<animate attributeName="stop-color" values="#93C258; #0F5A85; #793659; #58A9C2; #93C258" dur="15s" repeatCount="indefinite" />
			</stop>
			<stop offset="50%" stop-color="#0F5A85">
				<animate attributeName="stop-color" values="#0F5A85; #793659; #58A9C2; #93C258; #0F5A85" dur="15s" repeatCount="indefinite" />
			</stop>
			<stop offset="75%" stop-color="#793659">
				<animate attributeName="stop-color" values="#793659; #58A9C2; #93C258; #0F5A85; #793659" dur="15s" repeatCount="indefinite" />
			</stop>
			<stop offset="100%" stop-color="#58A9C2">
				<animate attributeName="stop-color" values="#58A9C2; #93C258; #0F5A85; #793659; #58A9C2" dur="15s" repeatCount="indefinite" />
			</stop>
		</linearGradient>
	</defs>
</svg>


</html>