import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params }) => {
	const includeFilter = url.searchParams.get('include');
	const { include } = RSSFeedParamsSchema.parse({ include: includeFilter });
	redirect(
		303,
		`https://status.orcfax.io/${params.rss_feed}${includeFilter ? `?include=${include.join(',')}` : ''}`
	);
};

const RSSFeedParamsSchema = z.object({
	include: z
		.string()
		.optional()
		.nullable()
		.transform((val) => {
			if (!val) return [];

			const categories = val.split(',').map((c) => c.trim());
			const validCategories = categories.filter((c) => c === 'blog_posts');

			return validCategories;
		})
});
