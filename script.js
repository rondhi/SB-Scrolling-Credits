// Edit your credits sections here
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
	{ section: "groups", key: "regulars", title: "Regulars", filterExistingEntries: true },
	{ section: "users", key: "users", title: "Viewers", filterExistingEntries: true },
	{ section: "top", key: "allBits", title: "All time top crazy people with bits!" },
	{ section: "top", key: "monthBits", title: "Monthly crazy people with bits, but only by a little" },
	{ section: "top", key: "weekBits", title: "Crazy people just this week with bits!" },
	{ section: "top", key: "channelRewards", title: "Folks with the most channel points to waste" },
	{ section: "custom", key: "custom", tite: "Testing this out" },
	{ section: "groups", key: "Extra Credit", title: "Butt" }, // Custom group: 'key' is group name in Streamer.bot, 'title' is the display name in the scrolling credits
	{ section: "custom", key: "bussin", title: "Bussin'" }, // Custom header added via C#
	{ section: "custom", key: "kofidono", title: "Kofi Donations" }, // Custom header added via C#
];

//////////// DON'T TOUCH \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const { StreamerbotClient } = window;  // Use Streamer.bot Client Library \\
const defaultPixelSpeed = 0.06;        // Default pixel speed             \\
const lowestPixelSpeed = 0.0120;       //                                 \\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// Can use URL parameters to set different options
function getUrlParameters() {
	const params = new URLSearchParams(window.location.search);                                               // Get URL parameters from browser                                        
	const host = params.get('host') || '127.0.0.1';                                                           // URL parameter for Streamer.bot Websocket server host, default 127.0.0.1
	const port = params.get('port') || 8080;                                                                  // URL parameter for Streamer.bot Websocket server port, default 8080     
	const scheme = getBooleanParam('secure') ? 'ws' : 'wss'; // Scheme is for either ws or wss, default ws
    const endpoint = params.get('endpoint') || '/'; // Websocket server endpoint, default '/'
    const password = params.has('password') ? decodeBase64(params.get('password')) : undefined; //
	const scrollingSpeed = parseInt(params.get('scrollingSpeedPercent'), 10) || 100;                          // URL Param for setting scrolling speed, default 100                     
	const iterations = parseInt(params.get('iterations'), 10) || 0;                                           // Number of times to repeat the credits, default Infinity                
	const removeBroadcaster = params.has('removeBroadcaster') ? getBooleanParam('removeBroadcaster') : true ; // Bool for removing Broadcaster/Bot from credits, default true           
	const testCredits = params.has('testCredits') ? getBooleanParam('testCredits') : false;                   // Bool for testing credits, default false                                
	const introImageUrl = params.get('introImageUrl') || '';                                                  // URL for intro image                                                    
	const introText = params.get('introText') || '';                                                          // Text to put at top of credits                                          
	const introImageFirst = params.has('introImageFirst') ? getBooleanParam('introImageFirst') : false;       // Bool for whether or not the intro image appears first                  
	const outroImageUrl = params.get('outroImageUrl') || '';                                                  // URL for outro image                                                    
	const outroText = params.get('outroText') || '';                                                          // Text to put at bottom of credits
	const outroImageFirst = params.has('outroImageFirst') ? getBooleanParam('outroImageFirst') : false;       // Bool for whether or not the outro image appears first                  
	const creditsDuration = parseInt(params.get('creditsDuration'), 10) || 0;                                // Number in seconds to try to aim for the credits duration to last. Alternative to scrollingSpeedPercent
	const pixelSpeed = parseFloat(params.get('pixelSpeed')) || defaultPixelSpeed;                             // Rate at which credits scroll. Alternative to scrollingSpeedPercent

	return { host, port, scheme, endpoint, password, scrollingSpeed, iterations, removeBroadcaster, testCredits, introImageFirst, introImageUrl, introText, outroImageFirst, outroImageUrl, outroText, creditsDuration, pixelSpeed };
}

// Function to get boolean value from URL parameter
function getBooleanParam(paramName) {
	const params = new URLSearchParams(window.location.search);
	const paramValue = params.get(paramName);
	return paramValue === 'true'; // Convert the string to boolean
}

// Function for decoding base64 encoded password
function decodeBase64(base64EncodedStr) {
  return atob(base64EncodedStr);
}

// Connect to Streamer.bot via Streamer.bot Client
const { host, port, scheme, endpoint, password } = getUrlParameters();
const sbClient = new StreamerbotClient({
	scheme: scheme,
	endpoint: endpoint,
	password: password,
	host: host,
	port: port,
	onConnect: (sbInfo) => {
		const sbName = sbInfo.name;
		console.log(`Connected to Streamer.bot '${sbName}' on ${host}:${port}`);
		displayCredits();
	}
});

// Display credits
async function displayCredits() {
	try {
		const { testCredits } = getUrlParameters();
		let msg;
		if (!testCredits) {
			console.log('Getting real credits')
			msg = await sbClient.getCredits(); // Get credits data
		} else {
			console.log('Getting test credits');
			msg = await sbClient.testCredits(); // Get test credits data
		}
		console.log('msg:', msg);

		const broadcasterData = await sbClient.getBroadcaster(); // Get broadcaster data for filtering out broadcaster and bot names
		console.log(`broadcasterData: '${broadcasterData}'`);

		generateCreditsDOM(msg, headers, broadcasterData);
	} catch (error) {
		console.error('Failed to fetch credits or broadcaster info:', error);
	}
}

function getParameterCaseInsensitive(object, key) {
	return object[Object.keys(object)
		.find(k => k.toLowerCase() === key.toLowerCase())
	];
}

// This function generates the actual credits
function generateCreditsDOM(msg, headers, broadcasterData) {
	const container = document.getElementById('credits');
	const existingUserMap = {};
	const elements = [];

	const { removeBroadcaster } = getUrlParameters();
	console.log(`removeBroadcaster: '${removeBroadcaster}'`);
	const broadcasterUsernames = extractBroadcasterUsernames(broadcasterData);

	for (const header of headers) {
		const headerSection = getParameterCaseInsensitive(msg, header.section);
		if (headerSection) {
			let eventData = getParameterCaseInsensitive(headerSection, header.key);
			if (!eventData) continue;

			// Filter out broadcaster and bot usernames
			if (removeBroadcaster) {
				eventData = eventData.filter(entry => !broadcasterUsernames.includes(entry.toLowerCase()));
			}

			// filter existing entries in the current section
			if (header.filterExistingEntries) eventData = eventData.filter(e => !existingUserMap[header.section] || !existingUserMap[header.section].includes(e));
			if (eventData.length > 0) {
				elements.push(`
					<div class="job">${header.title}</div>
					${Object.values(eventData).map(entry => `<div class="name">${entry}</div>`).join('')}
				`);

				// save output users by section
				if (!existingUserMap[header.section]) existingUserMap[header.section] = [];
				existingUserMap[header.section].push(...eventData);
			}
		}
	}

	const { introImageFirst, introImageUrl, introText, outroImageFirst, outroImageUrl, outroText } = getUrlParameters();

	// Add intro elements
	if (introImageUrl || introText) {
		if (introImageFirst) {
			if (introText) elements.unshift(`<div class="introText">${introText}</div>`);
			if (introImageUrl) elements.unshift(`<img src="${introImageUrl}" class="introImg"/>`);
		} else {
			if (introImageUrl) elements.unshift(`<img src="${introImageUrl}" class="introImg"/>`);
			if (introText) elements.unshift(`<div class="introText">${introText}</div>`);
		}
	}

	// Add outro elements
	if (outroImageUrl || outroText) {
		if (outroImageFirst) {
			if (outroImageUrl) elements.push(`<img src="${outroImageUrl}" class="outroImg"/>`);
			if (outroText) elements.push(`<div class="outroText">${outroText}</div>`);
		} else {
			if (outroText) elements.push(`<div class="outroText">${outroText}</div>`);
			if (outroImageUrl) elements.push(`<img src="${outroImageUrl}" class="outroImg"/>`);
		}
	}

	container.innerHTML = elements.join('');

	// Wait for DOM to update and then initialize animation
	setTimeout(() => {
	// document.addEventListener('DOMContentLoaded', () => {
		const introImage = document.querySelector('.introImg');
		const outroImage = document.querySelector('.outroImg');
		const introTextHeight = document.querySelector('.introText') ? document.querySelector('.introText').clientHeight : 0;
		const outroTextHeight = document.querySelector('.outroText') ? document.querySelector('.outroText').clientHeight : 0;

		// Calculate total height including intro and outro elements
		let totalHeight = container.scrollHeight;
		console.log(`container.scrollHeight: '${container.scrollHeight}'`);

		if (introImage && introImage.clientHeight > 0) {
			totalHeight += introImage.clientHeight;
			console.log(`introImage.clientHeight: '${introImage.clientHeight}'`);
		}
		if (introTextHeight > 0) {
			totalHeight += introTextHeight;
			console.log(`introTextHeight: '${introTextHeight}'`);
		}
		if (outroImage && outroImage.clientHeight > 0) {
			totalHeight += outroImage.clientHeight;
			console.log(`outroImage.clientHeight: '${outroImage.clientHeight}'`);
		}
		if (outroTextHeight > 0) {
			totalHeight += outroTextHeight;
			console.log(`outroTextHeight: '${outroTextHeight}'`);
		}

		// Initialize animation
		initAnimation(container, totalHeight);
	}, 0);
}

// Go through each connected platform and filter through and return list of broadcaster/bot names
function extractBroadcasterUsernames(broadcasterData) {
	const usernames = [];
	const platforms = broadcasterData.platforms;

	broadcasterData.connected.forEach(platform => {
		const data = platforms[platform];
		if (data) {
			usernames.push(data.broadcastUserName?.toLowerCase(), data.botUserName?.toLowerCase());
			usernames.push(data.broadcasterLogin?.toLowerCase(), data.broadcasterUserName?.toLowerCase());
			usernames.push(data.botLogin?.toLowerCase(), data.botDUserName?.toLowerCase());
		}
	});
	const filteredUsernames = usernames.filter(Boolean);
	console.log(filteredUsernames);

	return filteredUsernames; // Remove any undefined values
}

// This function is for the animation of the credits
function initAnimation(container, creditsHeight) {
	// Get duration and iterations from URL parameters
	const params = getUrlParameters();
	const {
		scrollingSpeed,  // Speed at which content scrolls (in milliseconds)
		iterations,      // Number of iterations for the animation
		creditsDuration, // Custom duration for credits (if provided)
		pixelSpeed       // Pixel speed value (used to calculate duration or as a custom input)
	} = params;
	const viewportHeightRatio = ((creditsHeight / window.innerHeight * 100));
	console.log(`URL Params\nscrollingSpeed: '${scrollingSpeed}' iterations: '${iterations}', viewportHeightRatio: '${viewportHeightRatio}' pixelSpeed: '${pixelSpeed}'`);

	let calculatedDuration; // Duration for which the animation will be executed

	if (pixelSpeed === defaultPixelSpeed) {
		if (creditsDuration > 0) {
			// If creditsDuration URL Param does exist
			calculatedDuration = creditsDuration * 1000; // Convert seconds to milliseconds
		} else {
			// If scrollingSpeedPercent URL Param does exist
			console.log(`scrollingSpeedPercent: '${scrollingSpeed}'`);
			const scrollingSpeedPercent = scrollingSpeed / 10000;
			calculatedDuration = (viewportHeightRatio + 100) / scrollingSpeedPercent;
		}
	} else if (!isNaN(pixelSpeed)) {
		// If pixelSpeed URL Param does exist
		calculatedDuration = (creditsHeight / window.innerHeight * 100 + (window.innerHeight / pixelSpeed));
		console.log(`Calculated duration based on custom pixel speed: ${calculatedDuration}`);
	} else {
		console.error(`Invalid pixel speed value: ${pixelSpeed}`);
	}

	// Calculate the pixel speed that would result from the given duration
	let calculatedPixelSpeed = (window.innerHeight / calculatedDuration).toFixed(4);
	console.log(`calculatedPixelSpeed: '${calculatedPixelSpeed}'`);

	// If pixel speed is too slow, recalculate duration using a default value
	if (calculatedPixelSpeed <= lowestPixelSpeed) {
		calculatedDuration = (creditsHeight / window.innerHeight * 100 + (window.innerHeight / lowestPixelSpeed));
		console.log(`Pixel speed too slow, new calculatedDuration: '${calculatedDuration}'`)
	}

	// Calculate the height at which the animation will end
	const creditsHeightEnd = Math.ceil((creditsHeight / window.innerHeight) * -100) - 10;
	
	console.log(`creditsHeight: '${creditsHeight}' window.innerHeight: '${window.innerHeight}'`);
	console.log(`creditsHeightEnd: '${creditsHeightEnd}' calculatedDuration: '${calculatedDuration}'`);

	container.animate(
		[
			{ top: '110%' }, // Initial position of the container (off-screen)
			{ top: `${creditsHeightEnd}%` }, // Final position of the container
		],
		{
			duration: calculatedDuration, // Duration for which the animation will be executed
			iterations: iterations === 0 ? Infinity : iterations // Number of iterations for the animation
		}
	);
}
