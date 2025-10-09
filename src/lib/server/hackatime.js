/**
 * Fetches projects from HackaTime API for a given user email and date
 * @param {string} email - User's email address
 * @param {string|null} date - Date in YYYY-MM-DD format
 * @param {string|null} startDate - Start date in YYYY-MM-DD format (optional)
 * @returns {Promise<Object>} - API response data
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * @param {string} email
 * @param {string|null} date
 * @param {string|null} [startDate]
 */
export async function fetchProjects(email, date, startDate = null) {
	try {
		const headers = {
			"Rack-Attack-Bypass": process.env.HACKATIME_RATE_LIMIT_BYPASS || '',
			"Authorization": "Bearer " + (process.env.STATS_API_KEY || ''),
		};

		const response = await fetch(`https://hackatime.hackclub.com/api/v1/users/lookup_email/${encodeURIComponent(email)}`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			// Try to get error details from the response
			let errorDetails = '';
			try {
				const errorBody = await response.text();
				errorDetails = errorBody;
			} catch (e) {
				errorDetails = 'Could not read error response';
			}
			
			console.error('HackaTime API error:', {
				status: response.status,
				statusText: response.statusText
			});
			
			throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
		}
		const data = await response.json();
		const hackatimeId = data.user_id;

		try {
			const headers2 = {
				"Rack-Attack-Bypass": process.env.HACKATIME_RATE_LIMIT_BYPASS || '',
			};

			let apiUrl = `https://hackatime.hackclub.com/api/v1/users/${hackatimeId}/stats?features=projects`;
			if (startDate) {
				apiUrl += `&start_date=${startDate}`;
			}

			const projectData = await fetch(apiUrl, {
				method: 'GET',
				headers,
			});

			const projdata = await projectData.json();
			return projdata;

		} catch (error) {
			console.error('Error fetching projects from HackaTime:', error);
			throw error;
		}
		
	} catch (error) {
		console.error('Error fetching projects from HackaTime:', error);
		throw error;
	}
}
