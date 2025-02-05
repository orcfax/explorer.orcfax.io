import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, params }) => {
	const categoryFilter = url.searchParams.get('category');
	const { category } = RSSFeedParamsSchema.parse({ category: categoryFilter });
	redirect(
		303,
		`https://status-test.server.orcfax.io/${params.rss_feed}${categoryFilter ? `?category=${category.join(',')}` : ''}`
	);
};

const RSSFeedParamsSchema = z.object({
	category: z
		.string()
		.optional()
		.nullable()
		.transform((val) => {
			if (!val) return ['incident_reports', 'network_updates'];

			const categories = val.split(',').map((c) => c.trim());
			const validCategories = categories.filter(
				(c) => c === 'incident_reports' || c === 'network_updates'
			);

			return validCategories.length ? validCategories : ['incident_reports', 'network_updates'];
		})
});
