function getParameterCaseInsensitive(object, key) {
  return object[Object.keys(object)
    .find(k => k.toLowerCase() === key.toLowerCase())
  ];
}

// Create WebSocket connection.
const socket = new WebSocket('ws://127.0.0.1:8080');

// get messages from the CPH socket
socket.onmessage = function (event) {
	const msg = JSON.parse(event.data);
	console.log('Message from server: ', msg);

	if (msg.id === 'credits') {
		// close the socket
		socket.close();

		const headers = [
			{ section: "events", key: "follows", title: "New Followers!" },
			{ section: "hypeTrain", key: "conductors", title: "Crazy ass Hype Train Conductors" },
			{ section: "hypeTrain", key: "contributors", title: "Those onboard the hype trains!" },
			{ section: "events", key: "cheers", title: "Cheers!" },
			{ section: "events", key: "subs", title: "New Subscribers!" },
			{ section: "events", key: "reSubs", title: "Those who Resubscribed!" },
			{ section: "events", key: "giftSubs", title: "Crazy people who gave gift subs!" },
			{ section: "events", key: "giftBombs", title: "Even crazier people who droped gift bombs!" },
			{ section: "events", key: "raided", title: "Thank you Raiders!" },
			{ section: "events", key: "rewardRedemptions", title: "Decided to waste channel points" },
			{ section: "events", key: "goalContributions", title: "Contributed to goals!" },
			{ section: "events", key: "pyramids", title: "Managed to make some pyramids!" },
			{ section: "users", key: "editors", title: "Editors" },
			{ section: "users", key: "moderators", title: "Moderators", filterExistingEntries: true },
			{ section: "users", key: "subscribers", title: "Subscribers" },
			{ section: "users", key: "vips", title: "VIPs!", filterExistingEntries: true },
			{ section: "groups", key: "BadAssBishes", title: "Bad Ass Bishes" },
			{ section: "groups", key: "Local Bishes", title: "All My Local Bishes" },
			{ section: "users", key: "users", title: "Viewers", filterExistingEntries: true },
			{ section: "hypeTrain", key: "conductors", title: "Crazy ass Hype Train Conductors" },
			{ section: "hypeTrain", key: "contributors", title: "Those onboard the hype trains!" },
			{ section: "top", key: "allBits", title: "All time top crazy people with bits!" },
			{ section: "top", key: "monthBits", title: "Monthly crazy people with bits, but only by a little" },
			{ section: "top", key: "weekBits", title: "Crazy people just this week with bits!" },
			{ section: "top", key: "channelRewards", title: "Folks with the most channel points to waste" }
		];

		// Generate DOM
		const container = document.getElementById('credits');
		const existingUserMap = {};
		const elements = [];
		for (const header of headers) {
			const headerSection = getParameterCaseInsensitive(msg, header.section);
			if (headerSection) {
				let eventData = getParameterCaseInsensitive(headerSection, header.key);
				if (!eventData) continue;

				// filter existing entries in the current section
				if (header.filterExistingEntries) eventData = eventData.filter(e => !existingUserMap[header.section] || !existingUserMap[header.section].includes(e));
				if (eventData.length > 0) {
					elements.push(`
						<div class="job">${ header.title }</div>
						${Object.values(eventData).map(entry => `<div class="name">${ entry }</div>`).join('')}
					`);

					// save output users by section
					if (!existingUserMap[header.section]) existingUserMap[header.section] = [];
					existingUserMap[header.section].push(...eventData);
				}
			}
		}
// Add a URL between the quotes in the src="" below to add an image at the start
    elements.unshift('<img src="" class="introImg"/>');
// Add text between the divs below to add intro text to the start
    elements.unshift('<div class="introText"></div>');
// Add text between the divs below to add outro text to the end
    elements.push('<div class="outroText"></div>');
// Add a URL between the quotes in the src="" below to add an image at the end
    elements.push('<img src="" class="outroImg"/>');
		container.innerHTML = elements.join('');

		// Init animation
		const creditsHeight = Math.ceil((container.offsetHeight / window.innerHeight) * -100) - 10;
		const duration = ((container.offsetHeight / window.innerHeight * 100) + 100) * 60;
		const creditsAnimation = container.animate([
				{ top: '110%' },
				{ top: creditsHeight + '%' }
			],{
				duration: duration,
				iterations: Infinity
			}
		);
	}
}

// set "request" to 'GetCredits', or 'TestCredits' for testing
socket.onopen = function (event) {
	const msg = {
		id: 'credits',
		request: 'GetCredits'
	};
	socket.send(JSON.stringify(msg));
};