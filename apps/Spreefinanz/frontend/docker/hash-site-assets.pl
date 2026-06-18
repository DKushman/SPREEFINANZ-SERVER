#!/usr/bin/env perl
# Runs at Docker build: fingerprints root CSS/JS from canonical files and rewrites site HTML only.
use strict;
use warnings;
use File::Copy qw(copy);
use File::Find qw(find);
use Digest::SHA qw(sha256_hex);

sub short_hash_file {
    my ($path) = @_;
    open my $fh, '<:raw', $path or die "open $path: $!";
    my $data = do { local $/; <$fh> };
    close $fh;
    return substr( sha256_hex($data), 0, 12 );
}

sub prune_path {
    my ($path) = @_;
    return $path =~ m{(?:^|/)_assets/} || $path =~ m{(?:^|/)node_modules/};
}

chdir '/usr/share/nginx/html' or die "chdir: $!";

# Optional build stamp: docker build --build-arg ASSET_BUILD_ID="$(date +%s)" ...
# Concatenated into JS/CSS content hash so every deploy can bust cache even if sources unchanged.
my $build_id = $ENV{ASSET_BUILD_ID} // '';

my %out;    # logical name => hashed basename (e.g. style => style.ab12cd34ef56.css)

for my $spec (
    [ style    => 'style.css',    'style.%s.css' ],
    [ style2   => 'style2.css',   'style2.%s.css' ],
    [ seoseiten => 'seoseiten.css', 'seoseiten.%s.css' ],
) {
    my ( $key, $src, $fmt ) = @$spec;
    next unless -f $src;

    my $h = short_hash_file($src);
    if ($build_id ne '') {
        $h = substr( sha256_hex( $h . ':' . $build_id ), 0, 12 );
    }
    my $dst = sprintf( $fmt, $h );
    copy( $src, $dst ) or die "copy $src -> $dst: $!";
    $out{$key} = $dst;
}

# JS: hash includes optional build id
for my $spec ( [ main => 'main.js', 'main.%s.js' ], ) {
    my ( $key, $src, $fmt ) = @$spec;
    next unless -f $src;

    open my $fh, '<:raw', $src or die "open $src: $!";
    my $data = do { local $/; <$fh> };
    close $fh;
    if ($build_id ne '') {
        $data .= "\n/*asset-build:$build_id*/\n";
    }
    my $h = substr( sha256_hex($data), 0, 12 );
    my $dst = sprintf( $fmt, $h );
    open my $outfh, '>:raw', $dst or die "open >$dst: $!";
    print {$outfh} $data;
    close $outfh or die "close $dst: $!";
    $out{$key} = $dst;
}

if ( -f 'form-inquiry.js' ) {
    my $h = short_hash_file('form-inquiry.js');
    if ($build_id ne '') {
        $h = substr( sha256_hex( $h . ':' . $build_id ), 0, 12 );
    }
    my $dst = "form-inquiry.$h.js";
    copy( 'form-inquiry.js', $dst ) or die "copy form-inquiry.js -> $dst: $!";
    $out{form_inquiry} = $dst;
}

# Remove superseded fingerprints at site root (keeps repo sources like style.css out of conflicting caches).
for (
    [ 'style.*.css',   sub { my ($f) = @_; return $f eq 'style.css' || ($out{style}   && $f eq $out{style}); } ],
    [ 'style2.*.css', sub { my ($f) = @_; return $f eq 'style2.css' || ($out{style2} && $f eq $out{style2}); } ],
    [ 'seoseiten.*.css', sub {
            my ($f) = @_;
            return $f eq 'seoseiten.css' || ( $out{seoseiten} && $f eq $out{seoseiten} );
        }
    ],
    [ 'main.*.js', sub { my ($f) = @_; return $f eq 'main.js' || ($out{main} && $f eq $out{main}); } ],
    [ 'form-inquiry.*.js', sub {
            my ($f) = @_;
            return $f eq 'form-inquiry.js'
                || ( $out{form_inquiry} && $f eq $out{form_inquiry} );
        }
    ],
  )
{
    my ( $glob, $keep ) = @$_;
    for my $f ( glob $glob ) {
        next if $keep->($f);
        unlink $f or warn "unlink $f: $!";
    }
}

# Drop canonical sources from the image so only hashed URLs are served.
unlink 'style.css'         if -f 'style.css';
unlink 'style2.css'        if -f 'style2.css';
unlink 'seoseiten.css'     if -f 'seoseiten.css';
unlink 'main.js'           if -f 'main.js';
unlink 'form-inquiry.js'   if -f 'form-inquiry.js';

my $hs = ( $out{style} =~ /^style\.([^.]+)\.css$/ )       ? $1 : die 'missing style fingerprint';
my $h2 = ( $out{style2} =~ /^style2\.([^.]+)\.css$/ )     ? $1 : die 'missing style2 fingerprint';
my $hm = ( $out{main} =~ /^main\.([^.]+)\.js$/ )          ? $1 : die 'missing main fingerprint';
my $hseo =
    ( $out{seoseiten} && $out{seoseiten} =~ /^seoseiten\.([^.]+)\.css$/ ) ? $1 : undef;
my $hfi =
    ( $out{form_inquiry} && $out{form_inquiry} =~ /^form-inquiry\.([^.]+)\.js$/ )
    ? $1
    : undef;

my @html;
find(
    sub {
        return if prune_path($File::Find::name);
        return unless -f && /\.html\z/;
        push @html, $File::Find::name;
    },
    '.'
);

for my $file (@html) {
    local $/;
    open my $fh, '<:encoding(UTF-8)', $file or die "open $file: $!";
    my $c = <$fh>;
    close $fh;

    $c =~ s{(href=["'])((?:\.\.\/|/)?)style(?:\.[a-zA-Z0-9]+)?\.css}{ $1 . ( $2 // '' ) . "style.$hs.css" }ge;
    $c =~ s{(href=["'])((?:\.\.\/|/)?)style2(?:\.[a-zA-Z0-9]+)?\.css}{ $1 . ( $2 // '' ) . "style2.$h2.css" }ge;
    if ( defined $hseo ) {
        $c =~ s{(href=["'])((?:\.\.\/|/)?)seoseiten(?:\.[a-zA-Z0-9]+)?\.css}{ $1 . ( $2 // '' ) . "seoseiten.$hseo.css" }ge;
    }
    $c =~ s{(src=["'])((?:\.\.\/|/)?)main(?:\.[a-zA-Z0-9]+)?\.js}{ $1 . ( $2 // '' ) . "main.$hm.js" }ge;
    if ( defined $hfi ) {
        $c =~ s#((?:src|href)=["'])((?:\.\./|/)?)form-inquiry(?:\.[a-zA-Z0-9]+)?\.js#$1 . $2 . "form-inquiry.$hfi.js"#ge;
    }

    open my $out, '>:encoding(UTF-8)', $file or die "write $file: $!";
    print {$out} $c;
    close $out;
}

print STDERR "Asset fingerprints: style=$hs style2=$h2 main=$hm";
print STDERR " seoseiten=$hseo" if defined $hseo;
print STDERR " form-inquiry=$hfi" if defined $hfi;
print STDERR "\n";
