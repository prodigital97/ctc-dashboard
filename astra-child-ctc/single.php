<?php
/**
 * The template for displaying all single posts.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package Astra
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

get_header(); ?>

<div id="ctc-post">
	<?php
	while ( have_posts() ) :
		the_post();

		// 1. Get the featured image URL (fallback to a premium default if not set)
		$hero_image = get_the_post_thumbnail_url( get_the_ID(), 'full' );
		if ( ! $hero_image ) {
			$hero_image = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80';
		}

		// 2. Get the primary category name
		$categories = get_the_category();
		$category_label = 'Destination Guides';
		if ( ! empty( $categories ) ) {
			$category_label = esc_html( $categories[0]->name );
		}

		// 3. Calculate read time automatically based on post word count (200 words per minute average)
		$content = get_the_content();
		$word_count = str_word_count( strip_tags( $content ) );
		$read_time_val = ceil( $word_count / 200 );
		$read_time = $read_time_val . ' MIN READ';

		// 4. Get post excerpt (fallback to automatic snippet if not defined)
		$excerpt = get_the_excerpt();
		if ( ! $excerpt ) {
			$excerpt = wp_strip_all_tags( $content );
			$excerpt = wp_html_excerpt( $excerpt, 150 ) . '...';
		}
		?>

		<!-- ===== HERO SECTION ===== -->
		<div class="ctc-hero">
			<img decoding="async" src="<?php echo esc_url( $hero_image ); ?>" class="ctc-hero-img" alt="<?php the_title_attribute(); ?>">
			<div class="ctc-hero-overlay"></div>
			<div class="ctc-hero-text">
				<div class="ctc-hero-tag"><?php echo esc_html( $category_label ); ?></div>
				<h1 class="ctc-hero-h1"><?php the_title(); ?></h1>
				<p class="ctc-hero-sub"><?php echo esc_html( $excerpt ); ?></p>
				<div class="ctc-hero-meta">UPDATED <?php the_modified_date('M Y'); ?> &bull; <?php echo esc_html( $read_time ); ?></div>
			</div>
		</div>

		<!-- ===== CORE CONTENT GRID ===== -->
		<article class="content-wrapper">
			<div class="ctc-main-content">
				<?php the_content(); ?>
				<div class="gold-divider"></div>
			</div>
		</article>

	<?php
	endwhile; // End of the loop.
	?>
</div>

<?php get_footer(); ?>
