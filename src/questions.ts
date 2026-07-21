/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from './types';

export const questions: Question[] = [
  // --- CATEGORY 1: FIRST IMPRESSIONS ---
  {
    id: 1,
    category: 'First Impressions',
    scenario: 'A customer calls and sounds frustrated from the moment you answer. What should you do first?',
    options: [
      'Begin troubleshooting immediately.',
      'Give a warm greeting, acknowledge their frustration, and confidently set a positive tone.',
      'Explain company policies before discussing the issue.',
      'Ask for all account details before responding to their emotions.'
    ],
    correctAnswerIndex: 1,
    tip: 'First impressions set the tone for the entire interaction. A confident and empathetic opening helps build trust from the start.',
    explanation: 'Top CSAT performers agreed that the first few seconds of an interaction shape the customer\'s overall perception. Responding to emotions first defuses tension before you start technical troubleshooting.',
    imageUrl: '/images/first_impressions.jpg'
  },
  {
    id: 11,
    category: 'First Impressions',
    scenario: 'You pick up a support ticket with a highly combative introductory message. How do you construct your opening reply?',
    options: [
      'Write a brief, purely objective reply to minimize reading effort.',
      'Address them formally, apologize for the friction immediately, and state with absolute confidence that you will resolve their issue.',
      'Politely remind them that combative language goes against user guidelines.',
      'Send a generic automated response to check if they are still online.'
    ],
    correctAnswerIndex: 1,
    tip: 'Confidence combined with an immediate apology for friction disarms defensive customers instantly.',
    explanation: 'Acknowledge the customer\'s state and show confident ownership right out of the gate. This pivots their mindset from fighting an system to collaborating with an expert.',
    imageUrl: '/images/angry_ticket.jpg'
  },
  {
    id: 12,
    category: 'First Impressions',
    scenario: 'A customer enters chat stating, "I\'m in a huge hurry and your last agent was useless!" What is your best first move?',
    options: [
      'Ask them to copy-paste their previous chat history to save time.',
      'Acknowledge the urgency, validate their previous bad experience, and declare yourself as their personal dedicated partner to get it fixed.',
      'Explain that the previous agent was probably following core protocols.',
      'Start a timer in the chat window to prove your speed.'
    ],
    correctAnswerIndex: 1,
    tip: 'When trust is broken by a previous interaction, establishing high personal accountability in your greeting is essential.',
    explanation: 'By taking complete, energetic ownership of their issue, you break the pattern of frustration and show that you represent immediate resolution.',
    imageUrl: '/images/q_12.jpg'
  },
  {
    id: 13,
    category: 'First Impressions',
    scenario: 'You are beginning a support session for a complex corporate account. How do you establish your professional presence?',
    options: [
      'Introduce yourself simply with your call sign, express enthusiasm to optimize their setup, and confirm you have their system logs open.',
      'Begin by asking if they have read the user setup manuals first.',
      'Send a long list of system credentials you need them to verify.',
      'Request that they hold for 2 minutes while you read their company file.'
    ],
    correctAnswerIndex: 0,
    tip: 'A strong first impression on high-tier accounts means proving you are already prepared and looking at their files.',
    explanation: 'Greeting them with prepared context (like having their logs open) signals extreme professionalism and respect for their time, establishing a premium floor experience.',
    imageUrl: '/images/q_13.jpg'
  },

  // --- CATEGORY 2: ACTIVE LISTENING ---
  {
    id: 2,
    category: 'Active Listening',
    scenario: 'A customer is explaining a complicated issue that has already taken several minutes. What\'s the best approach?',
    options: [
      'Interrupt once you think you know the problem.',
      'Let the customer finish, acknowledge their concerns, summarize what you understood, then begin resolving the issue.',
      'Skip the explanation and start reading troubleshooting steps.',
      'Transfer the customer to another department immediately.'
    ],
    correctAnswerIndex: 1,
    tip: 'Active listening helps customers feel heard and reduces misunderstandings, leading to better resolutions.',
    explanation: 'Interrupting customers can increase frustration and lead to critical details being missed. Confirming understanding first ensures you solve the correct problem on the first attempt.',
    imageUrl: '/images/active_listening.jpg'
  },
  {
    id: 21,
    category: 'Active Listening',
    scenario: 'During a call, a customer is sighing heavily and mentioning several unrelated software bugs. How do you find the root issue?',
    options: [
      'Tell them to focus on one problem at a time so you can log it.',
      'Listen closely to their story, take notes on pain points, and then read back the main blocker: "It sounds like your primary blocker is the export feature. Is that correct?"',
      'Diagnose the easiest bug first to get a quick CSAT win.',
      'Advise them to reinstall their operating system to clear all bugs.'
    ],
    correctAnswerIndex: 1,
    tip: 'Active listening is about parsing through emotional clutter to find and confirm the real operational bottleneck.',
    explanation: 'Summarizing the primary issue helps the customer organize their thoughts, validates their overwhelm, and aligns both of you on a clear target.',
    imageUrl: '/images/active_listening_notes.jpg'
  },
  {
    id: 22,
    category: 'Active Listening',
    scenario: 'A customer is talking extremely fast, skipping details, and sounds highly anxious about their data. How do you listen?',
    options: [
      'Match their fast speed so they don\'t feel you are slow.',
      'Take deep breaths, do not interrupt, and respond with a calm, measured pace: "I have written all of this down. Let\'s secure your backup first so you can breathe easily."',
      'Ask them to repeat themselves more slowly so you can type.',
      'Put them on silent mute while they vent to preserve your energy.'
    ],
    correctAnswerIndex: 1,
    tip: 'Empathy in active listening means absorbing their emotional high-frequency and returning a grounding, low-frequency reassurance.',
    explanation: 'Refusing to interrupt and answering with calm, deliberate pace stabilizes the panic, reassuring them that a competent professional is in absolute control.',
    imageUrl: '/images/q_22.jpg'
  },
  {
    id: 23,
    category: 'Active Listening',
    scenario: 'You recognize a customer\'s issue halfway through their sentence because you resolved a similar ticket 5 minutes ago. What do you do?',
    options: [
      'Interrupt them politely to give them the answer immediately and save handling time.',
      'Let them finish explaining their unique experience, validate their specific frustration, and then smoothly present the solution.',
      'Assume they are facing the exact same setup mistake and skip the logs check.',
      'Tell them "I already know what\'s wrong, please stop talking."'
    ],
    correctAnswerIndex: 1,
    tip: 'Even if the solution is standard, the customer\'s desire to be heard is unique. Cutting them off makes them feel like a ticket number.',
    explanation: 'Allowing them to finish honors their experience. It ensures you don\'t make a false diagnosis based on assumptions and builds deep personal rapport.',
    imageUrl: '/images/speedy_panicker.jpg'
  },

  // --- CATEGORY 3: POSITIVE LANGUAGE ---
  {
    id: 3,
    category: 'Positive Language',
    scenario: 'Which response demonstrates positive communication?',
    options: [
      '"Unfortunately, that\'s not possible."',
      '"There\'s nothing else I can do."',
      '"What I can do is help you with these available options."',
      '"You\'ll have to contact another department."'
    ],
    correctAnswerIndex: 2,
    tip: 'Top performers consistently focus on what they can do rather than what they can\'t.',
    explanation: 'Using positive phrasing frames the interaction around available options and helpful action. It keeps the energy solution-oriented instead of highlighting barriers.',
    imageUrl: '/images/positive_language.jpg'
  },
  {
    id: 31,
    category: 'Positive Language',
    scenario: 'A client requests a refund that is explicitly outside our 30-day corporate policy. How do you frame the rejection?',
    options: [
      'State: "According to terms, refunds after 30 days are strictly prohibited."',
      'State: "While the refund window has closed, what I can do right now is apply a loyalty credit or upgrade your plan for free to make sure you get full value!"',
      'Tell them to contact their bank to issue a chargeback.',
      'Say you will ask your manager, knowing your manager will say no.'
    ],
    correctAnswerIndex: 1,
    tip: 'Positive jargon means pivoting directly to actionable alternatives rather than leaving the customer empty-handed.',
    explanation: 'Framing around what you *can* do redirects their focus toward solutions and softens the impact of policy limitations, preserving their CSAT promoter status.',
    imageUrl: '/images/positive_language.jpg'
  },
  {
    id: 32,
    category: 'Positive Language',
    scenario: 'A server feature is down for emergency maintenance. How do you relay this to an affected customer?',
    options: [
      'State: "The system is broken and crashed. We have no estimated time of recovery."',
      'State: "Our engineers are actively performing a system upgrade to improve security. We expect full functionality to be restored by 3 PM, and I will personally email you the second it goes live!"',
      'Explain that server crashes are standard in this industry.',
      'Tell them to keep refreshing their screen until it works.'
    ],
    correctAnswerIndex: 1,
    tip: 'Avoid negative words like "broken," "crashed," or "failed." Replace them with "upgrade," "restoring," and "personal monitoring."',
    explanation: 'Negative triggers create panic and helplessness. Positive language instills confidence that the team is proactively working toward a better experience.',
    imageUrl: '/images/q_32.jpg'
  },
  {
    id: 33,
    category: 'Positive Language',
    scenario: 'A customer wants to buy a package that is currently out of stock. What do you say?',
    options: [
      '"Unfortunately, we are fully out of stock and have no inventory."',
      '"That item is currently unavailable. What I can do is register you for our early-access alert list so you get a 10% discount the moment it lands next week!"',
      '"You\'ll have to buy from our competitors for now."',
      '"Please call back in a couple of weeks to see if we have more."'
    ],
    correctAnswerIndex: 1,
    tip: 'Never end on a "no." Always bridge the gap with a positive next step or value-add.',
    explanation: 'Offering an active reservation with an added discount turns a disappointing out-of-stock scenario into an exciting, exclusive customer perk.',
    imageUrl: '/images/building_rapport.jpg'
  },

  // --- CATEGORY 4: PROCESS KNOWLEDGE ---
  {
    id: 4,
    category: 'Process Knowledge',
    scenario: 'A customer requests something that isn\'t available. What should you do?',
    options: [
      'Say it\'s impossible and move on.',
      'Focus on the available solutions, confidently explain the options, and guide the customer toward the best outcome.',
      'Tell the customer to call back later.',
      'Keep apologizing without offering an alternative.'
    ],
    correctAnswerIndex: 1,
    tip: 'Knowing your processes allows you to confidently present solutions instead of focusing on limitations.',
    explanation: 'Process mastery gives you the confidence to guide customers. When you frame options constructively, customers are much more likely to accept alternative resolutions happily.',
    imageUrl: '/images/process_knowledge.jpg'
  },
  {
    id: 41,
    category: 'Process Knowledge',
    scenario: 'A customer asks an extremely obscure technical policy question. You aren\'t 100% sure of the answer. What do you do?',
    options: [
      'Guess the policy to make sure you sound confident and preserve speed scores.',
      'State: "That\'s a great question. Let me consult our specialist resource base right now to ensure I give you 100% accurate information. It will take me less than a minute."',
      'Tell them that policy detail is internal corporate secret.',
      'Transfer them to another department in hopes that they know.'
    ],
    correctAnswerIndex: 1,
    tip: 'Confidence isn\'t about knowing everything instantly—it is about knowing how to locate accurate answers quickly and transparently.',
    explanation: 'Customers respect transparency. Confidently stating you are checking the official manual to ensure accuracy builds trust and protects you from giving false instructions.',
    imageUrl: '/images/process_knowledge.jpg'
  },
  {
    id: 42,
    category: 'Process Knowledge',
    scenario: 'A billing process requires the user to fill out an online validation form, but they are complaining about clicking links. How do you handle it?',
    options: [
      'Tell them there is no other way and they must click the link.',
      'Explain *why* the form exists (data security), and then guide them through it step-by-step: "I have the form open on my screen too. Let\'s do the first block together to make this effortless for you."',
      'Offer to write down their password and fill it out for them.',
      'Decline their ticket since they refuse to follow standard workflow.'
    ],
    correctAnswerIndex: 1,
    tip: 'When customers resist security processes, explaining the "why" and co-navigating makes them feel safe and supported.',
    explanation: 'Explaining that the link protects their sensitive financial data makes it a benefit, not a chore. Walking through it together eliminates friction.',
    imageUrl: '/images/q_42.jpg'
  },
  {
    id: 43,
    category: 'Process Knowledge',
    scenario: 'Your supervisor updates a core policy on a team huddle, but it makes a common customer workflow slightly longer. What is your mindset?',
    options: [
      'Complain to the customer about the "annoying new corporate rule" to build alignment.',
      'Master the new process immediately, understand its safety benefits, and explain it to customers with absolute confidence and clarity.',
      'Ignore the new policy and continue doing it the old way.',
      'Sigh heavily on calls whenever the new step is reached.'
    ],
    correctAnswerIndex: 1,
    tip: 'Elite CSAT performers never throw their company under the bus. They master policies to make them sound logical and secure.',
    explanation: 'Aligning with the process update and understanding the "why" allows you to present the workflow as a positive, protective feature, preserving your authority and customer peace of mind.',
    imageUrl: '/images/corporate_pro.jpg'
  },

  // --- CATEGORY 5: ADAPTABILITY ---
  {
    id: 5,
    category: 'Adaptability',
    scenario: 'One customer prefers a quick interaction, while another enjoys a friendly conversation. What\'s the best approach?',
    options: [
      'Use the same communication style for everyone.',
      'Adjust your communication style based on the customer\'s needs while remaining professional.',
      'Always keep the conversation as short as possible.',
      'Match the customer\'s frustration.'
    ],
    correctAnswerIndex: 1,
    tip: 'There isn\'t one perfect approach. Top performers adapt their style to each customer.',
    explanation: 'Every customer is unique. Recognizing cues about their preferred pace or tone and adapting accordingly creates a personalized experience that drives positive CSAT ratings.',
    imageUrl: '/images/adaptability.jpg'
  },
  {
    id: 51,
    category: 'Adaptability',
    scenario: 'You are chatting with an older user who is struggling with basic terminology like "browser cache." How do you adapt?',
    options: [
      'Speak very slowly and loudly, using technical jargon anyway.',
      'Pivot to simple everyday analogies (like cleaning a desk) and guide them with visual, physical cues rather than complex code terminology.',
      'Tell them they should ask a younger relative to help them.',
      'Send them the standard 15-page API technical integration document.'
    ],
    correctAnswerIndex: 1,
    tip: 'Adaptability means translating technical structures into friendly, familiar vocabulary that anyone can navigate.',
    explanation: 'Replacing cold system jargon with rich, warm metaphors keeps the customer comfortable, eliminates embarrassment, and guarantees a promoter review.',
    imageUrl: '/images/adaptability.jpg'
  },
  {
    id: 52,
    category: 'Adaptability',
    scenario: 'A highly structured, data-driven IT manager contacts you wanting raw error logs, not friendly conversation. How do you adapt?',
    options: [
      'Insist on asking about their weekend first to build rapport.',
      'Match their analytical style. Deliver concise, technical data logs immediately with clear, bulleted action items, keeping small talk minimal.',
      'Apologize excessively for the error logs being confusing.',
      'Send a generic "feel-good" corporate slogan.'
    ],
    correctAnswerIndex: 1,
    tip: 'Rapport for analytical customers is built through efficiency, technical precision, and absolute brevity.',
    explanation: 'Adapting to an analytical client means respecting their working style. Giving them raw facts and immediate data builds deep professional respect.',
    imageUrl: '/images/q_52.jpg'
  },
  {
    id: 53,
    category: 'Adaptability',
    scenario: 'You are handling multiple chats simultaneously. One customer is highly enthusiastic using emojis, while another is sending short, urgent sentences. How do you reply?',
    options: [
      'Use the exact same templated greeting for both chats to save clicks.',
      'Send happy emojis to the first customer, and clear, bulleted, lightning-fast solutions to the second customer.',
      'Tell the emoji user to be more professional, and tell the fast user to relax.',
      'Send robotic copy-paste lines to both.'
    ],
    correctAnswerIndex: 1,
    tip: 'A multi-tasking agent must have a fluid personality. Mirror the pacing and tone of each window to build rapid rapport.',
    explanation: 'Mirroring cues (within professional limits) makes each user feel like they are getting a modal experience tailored to their emotional state.',
    imageUrl: '/images/speed_clock.jpg'
  },

  // --- CATEGORY 6: BUILDING RAPPORT ---
  {
    id: 6,
    category: 'Building Rapport',
    scenario: 'The customer becomes more relaxed halfway through the interaction. What should you do?',
    options: [
      'Keep the conversation strictly formal.',
      'Become friendlier when appropriate while maintaining professionalism.',
      'Start making jokes.',
      'Rush to end the interaction.'
    ],
    correctAnswerIndex: 1,
    tip: 'A natural, friendly tone can strengthen rapport when it fits the conversation.',
    explanation: 'Matching a relaxed customer with a warmer, more conversational tone helps build a genuine human connection. As long as you maintain core professionalism, rapport is a powerful promoter catalyst.',
    imageUrl: '/images/building_rapport.jpg'
  },
  {
    id: 61,
    category: 'Building Rapport',
    scenario: 'While waiting for a diagnostic tool to run, there is a 30-second silence. How do you bridge the gap and build rapport?',
    options: [
      'Leave the line completely dead and silent to focus on the tool.',
      'Offer a friendly support-centric update: "Our system scanner is checking your setup now. It takes about 20 seconds. By the way, I noticed your account has been active since 2021—thank you so much for being with us!"',
      'Start humming or whistling loudly to break the silence.',
      'Ask them deeply personal questions about their family.'
    ],
    correctAnswerIndex: 1,
    tip: 'Idle wait times are golden opportunities to express customer appreciation and strengthen loyalty.',
    explanation: 'Using dead air to check their tenure and express genuine gratitude keeps them engaged and shows you value their long-term association.',
    imageUrl: '/images/speed_clock.jpg'
  },
  {
    id: 62,
    category: 'Building Rapport',
    scenario: 'A customer mentions in passing, "I\'m setting up this system for our non-profit children\'s home." How do you react?',
    options: [
      'Ignore the comment and stick strictly to the diagnostic logs.',
      'Acknowledge and praise their work: "That sounds like an incredible project! I want to make absolutely sure your network is pristine today so you can focus on those kids."',
      'Ask them if they can send you a donation receipt.',
      'Tell them that non-profits do not qualify for special faster routing.'
    ],
    correctAnswerIndex: 1,
    tip: 'Active listening hooks are the secret keys to elite rapport. Never ignore a personal details clue.',
    explanation: 'Validating their personal mission aligns you with them. It proves you are a warm, living human partner, and guarantees a glowing "Promoter" review.',
    imageUrl: '/images/q_62.jpg'
  },
  {
    id: 63,
    category: 'Building Rapport',
    scenario: 'A business owner calls to resolve an issue. They sound extremely stressed and say, "If this system is down, my shop loses $200 an hour." How do you build trust?',
    options: [
      'Tell them to buy our premium insurance package next time.',
      'Reassure them: "I completely understand the weight of this. I am locking down this case and won\'t leave this chat until we have your storefront fully processing sales. Let\'s get this fixed together."',
      'Explain that technical failures are natural and standard.',
      'Ask them for proof of their financial losses.'
    ],
    correctAnswerIndex: 1,
    tip: 'Rapport under pressure is built through deep, unshakeable alliance. Let them know they are not facing the crisis alone.',
    explanation: 'Aligning yourself with their business health and pledging absolute dedication instantly de-escalates the panic, turning a detractor-risk into a lifetime promoter.',
    imageUrl: '/images/building_rapport.jpg'
  },

  // --- CATEGORY 7: EMPATHY ---
  {
    id: 7,
    category: 'Empathy',
    scenario: 'A customer says, "I\'ve contacted support three times already." How should you respond?',
    options: [
      '"Please explain everything again."',
      '"I understand how frustrating that must be. I\'ll do my best to help resolve this today."',
      '"The previous agents probably followed the correct process."',
      'Ignore the frustration and continue troubleshooting.'
    ],
    correctAnswerIndex: 1,
    tip: 'Putting yourself in the customer\'s shoes helps build trust and shows genuine care.',
    explanation: 'Acknowledge the customer\'s history immediately. Taking extreme personal ownership of the problem and showing genuine understanding defuses the frustration built up from previous contacts.',
    imageUrl: '/images/empathy.jpg'
  },
  {
    id: 71,
    category: 'Empathy',
    scenario: 'A customer states they accidentally deleted their entire marketing campaign and are in literal tears. What do you do?',
    options: [
      'Explain: "User deletion is permanent. You should have read the warning popup."',
      'Acknowledge the disaster warmly: "Oh no, I can only imagine how much work went into that campaign. Take a deep breath. Let\'s check our database backups right now to see what we can recover. I am on this."',
      'Tell them to calm down because crying doesn\'t help recover files.',
      'Immediately put them on hold without saying anything.'
    ],
    correctAnswerIndex: 1,
    tip: 'Extreme empathy means treating the customer\'s operational disasters with the exact same emotional care you would show a close friend.',
    explanation: 'Validating their distress and instantly moving to a supportive partnership prevents emotional spiraling and lets them know they have an ally in the dark.',
    imageUrl: '/images/q_71.jpg'
  },
  {
    id: 72,
    category: 'Empathy',
    scenario: 'A customer is angry and insulting your software, calling it "trash." How do you handle your own emotional response?',
    options: [
      'Defend the software\'s reputation and explain that thousands of other users use it perfectly.',
      'Look past the angry words. Realize their anger is just stress about their broken workflow, stay calm, and focus on the solution: "I understand the setup has been frustrating. Let\'s get it running smoothly."',
      'Match their energy and hang up the call.',
      'Log their account as abusive and block their access.'
    ],
    correctAnswerIndex: 1,
    tip: 'Never take customer venting personally. Their anger is about their blocked goals, not about you.',
    explanation: 'Top performers understand that de-escalating anger requires absorbing the impact, remaining calm, and shifting the conversation directly to supportive troubleshooting.',
    imageUrl: '/images/speedy_panicker.jpg'
  },
  {
    id: 73,
    category: 'Empathy',
    scenario: 'An admin is confused because their system access was blocked due to an expired credit card. They are highly embarrassed. What is your tone?',
    options: [
      'Remind them that accounts require timely payments to avoid automated termination.',
      'Reassure them: "Please don\'t worry about it at all, this happens to all of us when credit cards rotate! Let\'s get your card updated together and restore your access immediately."',
      'Tell them that their financial oversight put their business at risk.',
      'Keep repeating "Payment failed" until they pay.'
    ],
    correctAnswerIndex: 1,
    tip: 'Normalize embarrassing user mistakes to eliminate shame and preserve their dignity.',
    explanation: 'By telling them "this happens to everyone," you remove the awkwardness and embarrassment, converting a billing roadblock into a positive trust-building moment.',
    imageUrl: '/images/empathy.jpg'
  },

  // --- CATEGORY 8: TONE OF VOICE ---
  {
    id: 8,
    category: 'Tone of Voice',
    scenario: 'Which statement best reflects effective tone of voice?',
    options: [
      'Speak as quickly as possible to reduce handling time.',
      'Maintain a calm, confident, and friendly tone throughout the interaction.',
      'Use the exact same tone regardless of the customer\'s emotions.',
      'Sound very formal to show professionalism.'
    ],
    correctAnswerIndex: 1,
    tip: 'Customers can\'t see you, but they can hear your attitude. Your tone plays a major role in their experience.',
    explanation: 'Since voice is your only channel of presence, speaking calmly and with warm confidence acts as a physical soothing agent, establishing safety and deep trust.',
    imageUrl: '/images/tone_of_voice.jpg'
  },
  {
    id: 81,
    category: 'Tone of Voice',
    scenario: 'You are explaining a complex, multi-step technical workflow. How do you regulate your speaking pace and tone?',
    options: [
      'Speak extremely fast to fit all instructions in before they get bored.',
      'Use a warm, steady, rhythmic tone. Pause after each core step to let them confirm, and use an upward, encouraging inflection: "Perfect. Now let\'s try step two."',
      'Deliver instructions in a completely flat, robotic tone to show technical authority.',
      'Mumble slightly so they have to focus harder to hear you.'
    ],
    correctAnswerIndex: 1,
    tip: 'Elite agents use musical phrasing—slowing down for technical details and using positive inflections to celebrate small user victories.',
    explanation: 'Breaking workflows into structured, positive bits with small verbal checks prevents cognitive fatigue and makes the user feel capable and proud.',
    imageUrl: '/images/active_listening_notes.jpg'
  },
  {
    id: 82,
    category: 'Tone of Voice',
    scenario: 'A customer asks, "Are you sure this fix will work?" How do you convey absolute reliability?',
    options: [
      'Say: "Well, it usually works, but systems are unpredictable."',
      'Answer with vibrant, smiling vocal resonance: "I am absolutely confident. I have reviewed your account logs myself, and this configuration will get you fully restored today!"',
      'Say: "It has to work because we have no other options."',
      'Decline to answer to avoid liability.'
    ],
    correctAnswerIndex: 1,
    tip: 'Confidence is contagious. If you sound 100% sure, the customer\'s anxiety dissolves instantly.',
    explanation: 'Using strong positive verbs ("absolutely confident," "personally reviewed") paired with a warm vocal tone sends a powerful signal of technical mastery.',
    imageUrl: '/images/q_82.jpg'
  },
  {
    id: 83,
    category: 'Tone of Voice',
    scenario: 'You are answering a call at the very end of an exhausting 10-hour shift. Your voice is tired. How do you prepare?',
    options: [
      'Allow your exhaustion to show so the customer is polite to you.',
      'Take a deep breath, stretch, smile physically (which changes your vocal cords), and deliver your opening greeting with clean, warm energy.',
      'Sigh loudly before speaking to set expectations.',
      'Keep your answers as short as possible to end the call.'
    ],
    correctAnswerIndex: 1,
    tip: 'Smiling while speaking physically raises your soft palate, making your voice sound warmer and more engaging.',
    explanation: 'Even when exhausted, top performers manage their energy. A brief physical reset and a conscious smile before answering keeps your CSAT floor scores high.',
    imageUrl: '/images/proactive_fcr_shield.jpg'
  },

  // --- CATEGORY 9: FIRST CONTACT RESOLUTION (FCR) ---
  {
    id: 9,
    category: 'First Contact Resolution (FCR)',
    scenario: 'You have everything needed to resolve the customer\'s issue during the current interaction. What\'s the best action?',
    options: [
      'Ask the customer to call back later.',
      'Resolve the issue during the first interaction whenever possible.',
      'Escalate the issue immediately.',
      'End the interaction after providing basic information.'
    ],
    correctAnswerIndex: 1,
    tip: 'Resolving issues on the first contact reduces customer effort and improves satisfaction.',
    explanation: 'FCR is one of the highest-correlated indicators of an excellent CSAT rating. It respects the customer\'s time and prevents repeat fatigue.',
    imageUrl: '/images/first_contact_resolution.jpg'
  },
  {
    id: 91,
    category: 'First Contact Resolution (FCR)',
    scenario: 'A user wants to close an issue, but you notice they have an outdated security certificate that will expire tomorrow. What do you do?',
    options: [
      'Close the ticket now since they solved their current question. Let them open a new one tomorrow.',
      'Proactively point out the expiring certificate, explain the risk, and help them renew it right now before concluding the session.',
      'Ignore it because certificates are managed by a different support desk.',
      'Tell them to write a memo to check it themselves later.'
    ],
    correctAnswerIndex: 1,
    tip: 'Elite FCR isn\'t just reactive—it is proactive. Fix future roadblocks before they can happen.',
    explanation: 'Anticipating and resolving next-day problems during the current session is the gold standard of FCR, preventing down-time and driving 5-star ratings.',
    imageUrl: '/images/proactive_fcr_shield.jpg'
  },
  {
    id: 92,
    category: 'First Contact Resolution (FCR)',
    scenario: 'An issue requires a simple backend database check that usually takes 3 minutes. It is easier to escalate it to Tier 2. What do you do?',
    options: [
      'Escalate the ticket to Tier 2 to clear your current queue and lower your handling time.',
      'Check your team manual, execute the database scan yourself, resolve the ticket on the spot, and keep the user on the line to confirm.',
      'Tell the customer to check the databases themselves.',
      'Mark the ticket as resolved without doing the check.'
    ],
    correctAnswerIndex: 1,
    tip: 'First contact resolution means doing the extra 3 minutes of work yourself rather than bouncing the customer across queues.',
    explanation: 'Bouncing tickets across departments increases customer effort and wait times. Taking ownership to resolve it yourself is the hallmark of a high-CSAT agent.',
    imageUrl: '/images/process_knowledge.jpg'
  },
  {
    id: 93,
    category: 'First Contact Resolution (FCR)',
    scenario: 'You solved the customer\'s primary question, but they sound slightly hesitant. How do you conclude the session?',
    options: [
      'Say "Goodbye" quickly and close the chat window immediately.',
      'Ask: "We have fully configured your export tool today. Before I let you go, is there any other bottleneck in your setup I can help optimize for you?"',
      'Tell them to rate you 5 stars in the survey.',
      'Send a generic disclaimer text block.'
    ],
    correctAnswerIndex: 1,
    tip: 'Never rush the exit. Invite final questions to ensure the resolution is 100% complete.',
    explanation: 'Proactively offering additional check-ups uncovers hidden questions. It ensures the customer is completely happy and comfortable before closing the ticket.',
    imageUrl: '/images/building_rapport.jpg'
  },

  // --- CATEGORY 10: GROWTH MINDSET ---
  {
    id: 10,
    category: 'Growth Mindset',
    scenario: 'You receive a detractor survey after an interaction. What\'s the best mindset?',
    options: [
      'Ignore it because you can\'t satisfy everyone.',
      'View the feedback as a learning opportunity, welcome coaching, and use it to improve future interactions.',
      'Assume the customer was being unfair.',
      'Focus only on your promoter scores.'
    ],
    correctAnswerIndex: 1,
    tip: 'Top performers understand that every piece of feedback—positive or negative—is an opportunity to learn and grow.',
    explanation: 'Normalize being coached on detractors! Detractors offer raw, direct insights into friction points. Approaching feedback with an open mind turns slip-ups into powerful skill building blocks.',
    imageUrl: '/images/growth_mindset.jpg'
  },
  {
    id: 101,
    category: 'Growth Mindset',
    scenario: 'Your supervisor schedules a coaching session to review a call where you used negative phrasing. How do you prepare?',
    options: [
      'Prepare a long list of excuses showing why the customer was impossible.',
      'Enter the session with an open mind, listen closely to the recording, and actively practice alternative, positive wording with your coach.',
      'Stay silent and agree with everything just to end the meeting quickly.',
      'Complain that other agents make the same mistakes without being coached.'
    ],
    correctAnswerIndex: 1,
    tip: 'Coaching is an investment in your career capital. Active engagement is how you master the floor.',
    explanation: 'Treating coaching as a collaborative lab to optimize your skills is what separates average representatives from elite, highly promoted support leaders.',
    imageUrl: '/images/corporate_pro.jpg'
  },
  {
    id: 102,
    category: 'Growth Mindset',
    scenario: 'A new AI tool is introduced to help summarize ticket logs. Some of your peers are complaining it will change their workflow. What is your perspective?',
    options: [
      'Join the complaints and refuse to open the new tool.',
      'Adopt the tool early, master its shortcuts, and leverage it to slash your administrative time so you can focus entirely on deep customer empathy.',
      'Use it but purposefully input bad summaries to prove it is useless.',
      'Wait for others to master it and only use it if threatened.'
    ],
    correctAnswerIndex: 1,
    tip: 'Growth-minded agents embrace technological changes as valuable leverage to automate chores and highlight their human talents.',
    explanation: 'By mastering tools early, you become the floor expert, elevating your professional profile and making your day-to-day work much easier.',
    imageUrl: '/images/q_102.jpg'
  },
  {
    id: 103,
    category: 'Growth Mindset',
    scenario: 'You notice that a peer is consistently getting 100% CSAT promoter ratings, while you are hovering around 85%. What do you do?',
    options: [
      'Assume they are getting the "easy" tickets or manipulating the surveys.',
      'Reach out to them, sit in on some of their live sessions, and study how they phrase difficult policy rejections in their chats.',
      'Stop checking your scores so you don\'t feel discouraged.',
      'Tell the manager that your peer\'s metrics look suspicious.'
    ],
    correctAnswerIndex: 1,
    tip: 'Success leaves clues. Never envy elite performance—study it, duplicate it, and integrate it into your own style.',
    explanation: 'Learning from high-performing colleagues is the fastest pathway to floor mastery. A growth mindset views peers as open libraries of gold best practices.',
    imageUrl: '/images/growth_mindset.jpg'
  }
];
