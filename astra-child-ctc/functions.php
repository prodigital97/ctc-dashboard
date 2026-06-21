<?php
/**
 * Astra Child Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Astra Child
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Enqueue styles and scripts.
 */
function astra_child_enqueue_styles() {
	// 1. Enqueue parent Astra styles
	wp_enqueue_style( 'astra-parent-theme-css', get_template_directory_uri() . '/style.css' );

	// 2. Enqueue child theme styling (with auto-cache busting)
	wp_enqueue_style( 'astra-child-theme-css', get_stylesheet_directory_uri() . '/style.css', array( 'astra-parent-theme-css' ), filemtime( get_stylesheet_directory() . '/style.css' ) );

	// 3. Enqueue google fonts needed for the premium blog layouts (serif + sans-serif pairing)
	wp_enqueue_style( 'ctc-blog-google-fonts', 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap', array(), null );

	// 4. Enqueue dynamic sidebar navigation script (only on single blog posts for optimal performance)
	if ( is_singular( 'post' ) ) {
		wp_enqueue_script( 'ctc-single-post-script', get_stylesheet_directory_uri() . '/js/ctc-single-post.js', array(), '1.0.0', true );
	}
}
add_action( 'wp_enqueue_scripts', 'astra_child_enqueue_styles' );

/**
 * Add Gutenberg block editor styles support.
 */
function astra_child_add_editor_styles() {
	add_theme_support( 'editor-styles' );
	add_editor_style( 'editor-style.css' );
	add_editor_style( 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap' );
}
add_action( 'after_setup_theme', 'astra_child_add_editor_styles' );

/**
 * Programmatic LiteSpeed Cache Purge Hook
 */
add_action( 'init', function() {
	if ( isset( $_GET['purge_all_caches'] ) ) {
		if ( class_exists( 'LiteSpeed\Purge' ) ) {
			\LiteSpeed\Purge::purge_all();
			wp_die( 'LiteSpeed Cache successfully purged!' );
		} else {
			wp_die( 'LiteSpeed Cache plugin is not active.' );
		}
	}
} );

/**
 * Disable wpautop and wptexturize on custom landing pages to prevent HTML/CSS corruption.
 */
add_action( 'wp', 'ctc_disable_wpautop_custom_pages' );
function ctc_disable_wpautop_custom_pages() {
	if ( is_page( array( 'destinations', 'blog', 'europe', 'asia', 'africa', 'middle-east', 'indian-ocean', 'americas' ) ) ) {
		remove_filter( 'the_content', 'wpautop' );
		remove_filter( 'the_content', 'wptexturize' );
	}
}

/**
 * Add a Search form to the end of the primary menu.
 */
add_filter( 'wp_nav_menu_items', 'ctc_add_search_to_menu', 10, 2 );
function ctc_add_search_to_menu( $items, $args ) {
	if ( $args->theme_location === 'primary' || $args->menu_id === 'ast-hf-menu-1' ) {
		$search_item = '<li class="menu-item menu-item-search ctc-search-header-item">' .
		               '<form role="search" method="get" class="ctc-header-searchform" action="' . esc_url( home_url( '/' ) ) . '">' .
		                 '<div class="ctc-search-input-wrapper">' .
		                   '<input type="search" class="ctc-search-field" placeholder="SEARCH..." value="' . get_search_query() . '" name="s" autocomplete="off" />' .
		                   '<button type="submit" class="ctc-search-submit">' .
		                     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' .
		                   '</button>' .
		                 '</div>' .
		               '</form>' .
		               '</li>';
		$items .= $search_item;
	}
	return $items;
}

/**
 * Redirect category archive pages to the main Blog page with a filter query parameter.
 */
add_action( 'template_redirect', 'ctc_redirect_category_archives' );
function ctc_redirect_category_archives() {
	if ( is_category() ) {
		$category = get_queried_object();
		if ( $category && isset( $category->slug ) ) {
			$redirect_url = home_url( '/blog/?filter=' . $category->slug );
			wp_safe_redirect( $redirect_url, 301 );
			exit;
		}
	}
}

/**
 * Redirect standard search results to the dynamic Blog search page.
 */
add_action( 'template_redirect', 'ctc_redirect_search_results' );
function ctc_redirect_search_results() {
	if ( is_search() ) {
		$search_query = get_search_query( false );
		if ( $search_query !== '' ) {
			$redirect_url = home_url( '/blog/?search=' . urlencode( $search_query ) );
			wp_safe_redirect( $redirect_url, 301 );
			exit;
		}
	}
}

