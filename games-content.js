// Edit rules, seconds and prompts here as the party plan changes.
// Optional prompt.audio paths must point to clips you have permission to use.
// Uploaded audio stays in this browser tab and is not uploaded or saved after a reload.
// Rapid games use consecutive packs of roundSize prompts. Each gets guessSeconds,
// then revealSeconds for its answer and optional transitionSeconds for a "Next!"
// changeover. Extras after full rounds form a shorter bonus round.
// readAloud waits for a host click before each answer timer; reading time is untimed.
// Optional trialPrompt is separate from the playable pack for an untimed, unscored trial.
// "Yes Exit / No Entry" is reserved for the instructions, not the playable deck.
window.partyGames = [
  {
    id: "bollywood", title: "Bollywood Opposites", group: "teams", mode: "rapid", seconds: 132,
    roundSize: 12, guessSeconds: 10, revealSeconds: 1,
    example: { text: "Yes Exit", answer: "No Entry", tip: "This is a practice example, not a clue in the game." },
    intro: "The competing teams guess together. The host judges answers and keeps points manually.",
    supplies: "No props; a whiteboard for your scores.",
    rules: [
      "Say: 'Decode the opposite movie title. Bollywood knowledge, questionable logic!' Only the called players answer; no teammate hints.",
      "Choose a round, then START. Each clue gets 10 seconds to guess + a 1-second answer reveal. The next clue starts automatically.",
      "First correct team: one point. You judge and record it; accept sensible word-swap alternatives.",
      "Tap the clue to skip, Reveal answer to check early, or Pause for a breather."
    ],
    prompts: [
      { text: "Principal of the Day", answer: "Student of the Year" },
      { text: "Go to Sleep Sid", answer: "Wake Up Sid" },
      { text: "Sad Old Year", answer: "Happy New Year" },
      { text: "Always Say Goodbye", answer: "Kabhi Alvida Naa Kehna" },
      { text: "Always Happy but Always Sad", answer: "Kabhi Khushi Kabhie Gham" },
      { text: "Dad", answer: "Mom" },
      { text: "Nothing Nothing Happens", answer: "Kuch Kuch Hota Hai" },
      { text: "Stars Akash Mai", answer: "Taare Zameen Par" },
      { text: "Multiple Friends", answer: "Ek Villain" },
      { text: "Divorce", answer: "Vivah" },
      { text: "Mansion Boy", answer: "Gully Boy" },
      { text: "Heart Doesn't Love", answer: "Dil Chahta Hai" },
      { text: "Byebye", answer: "Welcome" },
      { text: "You Honest, Me Also Truthful", answer: "Tu Jhoothi Main Makkaar" },
      { text: "Empty House", answer: "Housefull" },
      { text: "Bad Newz", answer: "Good Newwz" },
      { text: "We Never Met", answer: "Jab We Met" },
      { text: "Purush", answer: "Stree" },
      { text: "I Love Hate Stories", answer: "I Hate Luv Storys" },
      { text: "King", answer: "Queen" },
      { text: "Don't Marry Me", answer: "Mujhse Shaadi Karogi" },
      { text: "Dad of Sardar?", answer: "Son of Sardaar" },
      { text: "God Never Made This Jodi", answer: "Rab Ne Bana Di Jodi" },
      { text: "Hatred These Days", answer: "Love Aaj Kal" },
      { text: "You Always Know", answer: "Jaane Tu... Ya Jaane Na" },
      { text: "Babes, Do Not Fear xP", answer: "Bachna Ae Haseeno" },
      { text: "Mocktail", answer: "Cocktail" },
      { text: "Bareilly's Spice", answer: "Bareilly Ki Barfi" },
      { text: "Faltu Life", answer: "Dear Zindagi" },
      { text: "I Am Not There", answer: "Main Hoon Na" },
      { text: "Wishing You the Worst", answer: "All the Best" },
      { text: "Everyone Is Killing Jessica", answer: "No One Killed Jessica" },
      { text: "Not Forgiving Your 7 Murders", answer: "7 Khoon Maaf" },
      { text: "12th Pass", answer: "12th Fail" },
      { text: "Haye Bhagvan", answer: "Thank God" },
      { text: "3 Geniuses", answer: "3 Idiots" },
      // User-requested book-title clue; its film adaptation is Kai Po Che!
      { text: "3 Accomplishments of My Life", answer: "3 Mistakes of My Life (book)" },
      { text: "Nahi Tha Tiger?", answer: "Ek Tha Tiger" },
      { text: "Don't Kick xP", answer: "Kick" },
      { text: "Cold Masala", answer: "Garam Masala" },
      { text: "I'll Always Get Life", answer: "Zindagi Na Milegi Dobara" },
      { text: "Don't Let Heart Beat", answer: "Dil Dhadakne Do" },
      { text: "Don't Look Again", answer: "Baar Baar Dekho" },
      { text: "Till Life Isn't There", answer: "Jab Tak Hai Jaan" },
      { text: "Aram Se Gadi Chalao", answer: "Race" },
      { text: "Everyday in Mumbai", answer: "Once Upon a Time in Mumbaai" },
      { text: "Everyday in Mumbai Again", answer: "Once Upon Ay Time in Mumbai Dobaara!" },
      { text: "Full Boyfriend", answer: "Half Girlfriend" },
      { text: "Singh Raja Nai Ho Paega", answer: "Singh Is Kinng" },
      { text: "Love Is Possible", answer: "Pyaar Impossible!" },
      { text: "Saint Aadmi", answer: "Don" },
      { text: "Clear Vision", answer: "Andhadhun" },
      { text: "Found", answer: "Talaash" },
      { text: "Maafi", answer: "Badla" },
      { text: "I'm Your Everything", answer: "Hum Aapke Hain Koun..!" },
      { text: "13Y", answer: "13B" },
      { text: "Somebody Got Lost", answer: "Koi... Mil Gaya" },
      { text: "The Clean Picture", answer: "The Dirty Picture" },
      { text: "We Aren't Together", answer: "Hum Saath-Saath Hain" },
      { text: "Bye London", answer: "Namastey London" }
    ]
  },
  {
    id: "alphabet", title: "Alphabet Object Dash", group: "teams", mode: "rapid", seconds: 88,
    roundSize: 8, guessSeconds: 10, revealSeconds: 0, transitionSeconds: 1, promptUnit: "letter",
    example: { text: "Find something starting with L", answer: "A lamp", tip: "Point out the lamp to the host without moving it. This practice letter is not in the game." },
    intro: "One player from every team searches at the same time. Find or point out a safe object beginning with the displayed letter within ten seconds. First valid object earns one point; the host judges and scores manually.",
    lineGuide: "Use a different teammate for each letter, cycling through each team's queue. A full-screen NEXT! cue lasts one second, then the next ten-second search starts automatically. Pause for extra time to change players or settle a point.",
    supplies: "Objects already in the agreed party area.",
    rules: [
      "Say: 'Find something starting with this letter. Pointing counts; parkour does not!' Only called players search; no teammate hints.",
      "Press START: eight letters, 10 seconds each. At the 1-second NEXT!, switch players; the next letter starts automatically.",
      "Award one point for the first valid object. Nothing by time-up = zero. You judge and keep score; most points wins, ties can share.",
      "Stay in the agreed party area. No private rooms, cupboards, unsafe objects, climbing or running.",
      "Pause whenever judging or changing players needs longer."
    ],
    prompts: [..."ABCMPSTW"].map(letter => ({ text: `Find something starting with...\n${letter}` }))
  },
  {
    id: "hook-step", title: "Hook-Step Roulette", group: "teams", mode: "audio", seconds: 30,
    supplies: "A speaker and your own permitted audio clips.",
    rules: [
      "Say: 'Talent optional. Commitment compulsory!' Show the dance challenge and get the dancers ready.",
      "Add a clip you have permission to use, then press Play. Use the optional 30-second timer.",
      "Let them perform, cheer loudly, and award a point yourself.",
      "Next turn: change the challenge or clip and rotate dancers."
    ],
    prompts: [
      { text: "Mickey-style clubhouse dance!\nMake it your funniest cartoon dance." },
      { text: "Do your favourite Bollywood hook step." },
      { text: "Dance like a robot trying to become a Bollywood star." },
      { text: "Perform a dramatic slow-motion entrance." },
      { text: "Dance like you're celebrating a last-ball cricket win." },
      { text: "Invent a birthday hook step for Ash." }
    ]
  },
  {
    id: "dance-telephone", title: "Copy the Step", group: "teams", mode: "secret", seconds: 60,
    supplies: "Enough clear space for equal-length team lines. All actions and props are imaginary.",
    rules: [
      "Say: 'Pass the action, not an explanation!' Make equal-length lines. Show the SAME situation to each first actor only, then hide it.",
      "Start 60 seconds for the whole chain AND final guess. Each actor performs once for the next player. Everyone else faces away.",
      "No talking, sounds, spelling, real props or outside help. Last players give you their guesses privately before time-up.",
      "Lock every team's guess before revealing. Award one point per correct team; exact wording is not needed. Record scores; most points after agreed rounds wins, ties can share.",
      "Rotate roles and extras. Mime safely: no real fireworks, spills, falls or collisions; run on the spot. Adapt actions or pass."
    ],
    prompts: [
      { text: "Killing a mosquito: spot it, chase it, and swat it." },
      { text: "Lighting an imaginary Diwali pataka and running away at Flash speed. Mime running on the spot!" },
      { text: "Hailing a cab that keeps ignoring you." },
      { text: "Opening an umbrella that won't open in heavy rain." },
      { text: "Eating something unexpectedly spicy." },
      { text: "Trying to close an overstuffed suitcase." },
      { text: "Walking into a spiderweb." },
      { text: "Taking a selfie but struggling to get the right angle." },
      { text: "Carrying too many grocery bags and trying to unlock the door." },
      { text: "Sneaking a snack from the kitchen at midnight." },
      { text: "Chasing a hat that keeps blowing away." },
      { text: "Trying to put on jeans that are too tight." },
      { text: "Catching a phone before it falls." },
      { text: "Trying to stay awake during a boring meeting." },
      { text: "Stepping on something sticky and trying to get it off your shoe." },
      { text: "Opening a shaken fizzy drink and trying to stop the overflow." },
      { text: "Trying to open a stubborn pickle jar." },
      { text: "Looking for your glasses while wearing them on your head." },
      { text: "Brushing your teeth and suddenly needing to sneeze." },
      { text: "Trying to get the last drop of ketchup out of a bottle." },
      { text: "Peeling an onion and trying not to cry." },
      { text: "Trying to kill time while a painfully slow lift arrives." },
      { text: "Struggling to untangle a pair of earphones." },
      { text: "Trying to catch popcorn in your mouth and missing every time." },
      { text: "Washing your hands when the automatic tap won't detect them." },
      { text: "Trying to squeeze toothpaste from an almost-empty tube." },
      { text: "Realising you have waved enthusiastically at a complete stranger." },
      { text: "Trying to carry a bowl of soup without spilling it." },
      { text: "Pushing a door repeatedly before realising it says pull." },
      { text: "Trying to fold a bedsheet that is much bigger than you." }
    ]
  },
  {
    id: "wrong-answers", title: "Wrong Answers Only", group: "teams", mode: "rapid", seconds: 132,
    roundSize: 22, guessSeconds: 5, revealSeconds: 0, transitionSeconds: 1,
    example: { text: "What do you drink when you're thirsty?", answer: "An umbrella!", tip: "'Water' would be a fail. Any clearly wrong answer works. This practice question is not used in the rounds." },
    intro: "The front person gives a clearly wrong answer. A correct answer, silence, or repeating the question is a fail. The host judges, not the website. Move to the back after your turn.",
    lineGuide: "Alternate players from opposing teams; agree on the turn order in the room. Agree on an optional silly face, brief seated statue pose, or water/mocktail sip for a fail. Anyone may pass.",
    supplies: "No props; make a queue for each team.",
    rules: [
      "Say: 'Be confidently incorrect!' Choose one of three 22-question rounds, then START. Only the called player answers.",
      "A clearly wrong answer in 5 seconds = one point if scoring. Correct answer, silence or repeating the question = zero. You judge and record points.",
      "At the 1-second NEXT!, go to the back of your team's queue. The next question starts automatically. Keep the team order across round breaks.",
      "Use Next person to skip or Pause for extra time. Take a breather between rounds.",
      "Optional fail challenge: silly face, seated statue pose or water/mocktail sip. Passing is fine; nobody has to drink."
    ],
    prompts: [
      { text: "What do you eat your food with?" },
      { text: "What do you sleep on?" },
      { text: "What do you wear on your feet?" },
      { text: "What colour is the sky on a clear day?" },
      { text: "What do you call a person who teaches students?" },
      { text: "What colour is grass?" },
      { text: "What do you use to brush your teeth?" },
      { text: "Where do you keep ice cream cold?" },
      { text: "What do you use to tell the time?" },
      { text: "What do you call a baby dog?" },
      { text: "What do you open to enter a room?" },
      { text: "What do you use to wash your hair?" },
      { text: "Which animal says meow?" },
      { text: "How many wheels does a bicycle have?" },
      { text: "What do you sit on at a dining table?" },
      { text: "What do you use to write on paper?" },
      { text: "Which fruit is yellow and curved?" },
      { text: "Where do fish live?" },
      { text: "What do you hold over your head when it rains?" },
      { text: "What do you wear on your head to block the sun?" },
      { text: "What do you use to cut paper?" },
      { text: "What do you put on your toothbrush?" },

      { text: "Who delivers letters to your house?" },
      { text: "Who treats people when they are ill?" },
      { text: "Which vehicle flies through the sky?" },
      { text: "Which vehicle runs on railway tracks?" },
      { text: "What do you use to unlock a door?" },
      { text: "What do you switch on to see a dark room?" },
      { text: "What do you clap with?" },
      { text: "Which body part do you use to smell?" },
      { text: "Which body part do you use to hear?" },
      { text: "Which body part do you use to see?" },
      { text: "What do you wear to keep your hands warm?" },
      { text: "What do you use to clean the floor?" },
      { text: "Where do you normally put your pillow?" },
      { text: "What do hens lay?" },
      { text: "Which animal barks?" },
      { text: "Which animal has a long trunk?" },
      { text: "Which animal gives us wool?" },
      { text: "What do bees make?" },
      { text: "What do birds use to fly?" },
      { text: "What do you call someone who cooks in a restaurant?" },
      { text: "Where do you go to watch a film on a big screen?" },
      { text: "What do you call the person who drives a bus?" },

      { text: "What are we celebrating today?" },
      { text: "Whose birthday are we celebrating?" },
      { text: "What do you blow out on a birthday cake?" },
      { text: "What do you cut at a birthday party?" },
      { text: "What do you use to wrap a birthday gift?" },
      { text: "What do you usually say to someone on their birthday?" },
      { text: "What do you use to take a photograph?" },
      { text: "What do you use to call someone who is far away?" },
      { text: "Which letter comes after A?" },
      { text: "Which number comes after one?" },
      { text: "What do you call frozen water?" },
      { text: "What normally falls from rain clouds?" },
      { text: "What colour is a ripe tomato?" },
      { text: "Where do you bake a pizza?" },
      { text: "What do you use to carry groceries home?" },
      { text: "What do you normally put on a bookshelf?" },
      { text: "What do you call the meal you eat first thing in the morning?" },
      { text: "What do you play music through so everyone can hear?" },
      { text: "Which appliance turns bread into toast?" },
      { text: "What do you use to dry yourself after a shower?" },
      { text: "What do you wear when you go swimming?" },
      { text: "Which day comes after Monday?" }
    ]
  },
  {
    id: "movie-backwards", title: "Movie Titles Backwards", group: "teams", mode: "rapid", seconds: 132,
    roundSize: 11, guessSeconds: 10, revealSeconds: 0, transitionSeconds: 2, promptUnit: "title", readAloud: true,
    example: { text: "Dil Chahta Hai", answer: "Hai Chahta Dil", tip: "The teammate says 'Dil Chahta Hai' once. The player faces away from the screen and answers 'Hai Chahta Dil' from memory. Reverse words, not letters. This practice title is not used in either round." },
    intro: "One player faces away from the screen. A teammate faces the screen and reads the title aloud once, in its normal order. No repeats, hints, or help with reversing it. The player then says the whole title backwards from memory, keeping each word unchanged. The host judges and records points manually; the website does not listen or score.",
    lineGuide: "Rotate player-reader pairs from opposing teams; agree on the turn order in the room. During NEXT!, get the next player facing away and their teammate ready to read. Swap reader and answering roles so everyone gets to play. Any silly forfeit is optional; anyone may pass.",
    supplies: "No props; one reader + one answering teammate per turn.",
    rules: [
      "Say: 'Reverse the words, not your brain!' Answerer faces AWAY before you press START. Reader says the title once in normal order; no repeats or hints.",
      "Reading is untimed. When the reader finishes, press Start 10s. The answerer reverses the word order from memory; keep each word intact. No peeking!",
      "Correct reversal = one point; wrong or silent = zero. You score. Reveal answer checks it after they answer; answers never reveal automatically.",
      "At the 2-second NEXT!, switch pairs. Each new title waits for its reader and your Start 10s click. Swap reader/answerer roles.",
      "Two rounds, 11 unique titles each. Pause/Resume controls the countdown; Next person skips. Reading is excluded from timed play. Any forfeit is optional; passing is fine."
    ],
    prompts: [
      "Zindagi Na Milegi Dobara",
      "Mere Brother Ki Dulhan",
      "Kabhi Khushi Kabhie Gham",
      "The Devil Wears Prada",
      "Jab Harry Met Sejal",
      "The Parent Trap",
      "The Pursuit of Happyness",
      "A Walk to Remember",
      "The Chronicles of Narnia",
      "Hum Saath Saath Hain",
      "The Fault in Our Stars",

      "Kabhi Haan Kabhi Naa",
      "Yeh Jawaani Hai Deewani",
      "Hum Aapke Hain Koun",
      "Ajab Prem Ki Ghazab Kahani",
      "Band Baaja Baaraat",
      "Pyaar Kiya To Darna Kya",
      "Bachna Ae Haseeno",
      "Humko Deewana Kar Gaye",
      "Kal Ho Naa Ho",
      "Mere Yaar Ki Shaadi Hai",
      "Bareilly Ki Barfi"
    ].map(text => ({ text, answer: text.split(/\s+/).reverse().join(" ") }))
  },
  {
    id: "tunnel-vision", title: "Cone & Bottle Challenge", group: "teams", mode: "challenge", seconds: 45,
    supplies: "Paper viewing cones, blunt paper straws, wide-neck bottles or cups, and a table.",
    rules: [
      "Say: 'Three straws. Tiny view. Huge confidence.' Keep the whole challenge on a table.",
      "Hold the cone in front of your face, not against your eye. Look through it and place three blunt paper straws in the container.",
      "Start the 45-second timer. First player/team to place all three earns one point.",
      "Stay stationary. No walking with restricted vision and no sharp sticks."
    ],
    prompts: [
      { text: "Three straws. One container. Tunnel vision!\nFirst to place all three wins." },
      { text: "Team relay: place three straws in total per team, swapping players after each straw." }
    ]
  },
  {
    id: "drawing-telephone", title: "Draw Behind the Back", group: "teams", mode: "secret", seconds: 140, continuous: true,
    trialPrompt: "Mountains",
    supplies: "Paper and washable markers for everyone.",
    rules: [
      "Say: 'Your back is the message board. Good luck, artists!' Make equal-length lines. Show the SAME secret drawing to starting artists only; no hints from waiting players.",
      "With permission, draw gently on PAPER against the next person's back, never skin. They copy what they felt onto the next person's paper; the front player guesses. No talking or peeking. Back contact is optional.",
      "For the scored game, choose the prompt count and total time (up to 10 minutes). Quick suggestions: 8 drawings / 90 seconds or 12 / 140. Add time for longer chains.",
      "First correct team = one point. You record it, then click Next drawing. Everyone drops the old drawing; reveal the new one to artists only and rotate roles/extras.",
      "One clock covers drawing, reveals and swaps; Next drawing NEVER resets it. Stop at time-up or pack completion. The site does not judge guesses or award points."
    ],
    prompts: [
      { text: "A house with a chimney and one window" },
      { text: "A birthday cake with three candles" },
      { text: "A cat with a long tail" },
      { text: "A flower in a pot" },
      { text: "A bicycle" },
      { text: "An umbrella in the rain" },
      { text: "A kite" },
      { text: "An ice cream cone" },
      { text: "An apple" },
      { text: "A fish" },
      { text: "A tree" },
      { text: "A heart" }
    ]
  },
  {
    id: "balloon-cups", title: "Balloon Cup Relay", group: "teams", mode: "challenge", seconds: 60,
    supplies: "Five lightweight cups per team, individual balloons, and a clear table.",
    rules: [
      "Say: 'Balloon forklifts ready? Hands off the cups!' Give every team an identical, clearly marked lane.",
      "Put your own balloon's opening inside an upright cup. Inflate until it grips, lift with the balloon, then deflate to release at the finish.",
      "Start 60 seconds. First team to move all five cups wins; hands must not hold the cups.",
      "Never share balloons. A hand pump is fine."
    ],
    prompts: [
      { text: "Move all five cups to the finish line.\nNo hands on the cups!" },
      { text: "Relay edition: move five cups in total per team, swapping players after each cup." }
    ]
  },
  {
    id: "balloon-knockdown", title: "Balloon Cup Knockdown", group: "teams", mode: "challenge", seconds: 45,
    supplies: "Lightweight cups, individual balloons, a table, and a clear landing area.",
    rules: [
      "Say: 'Big puff, tiny hurricane!' Line up identical cup sets for every team.",
      "Inflate your own balloon. Aim escaping air at the cups; no touching them. Start the 45-second timer.",
      "First to clear all five off the far edge earns one point. Accuracy prompt: race three cups across the taped finish line instead.",
      "Keep people and breakables out of the landing area."
    ],
    prompts: [
      { text: "Use balloon air to knock down all five cups!" },
      { text: "Accuracy round: move three cups across a taped finish line." }
    ]
  },
  {
    id: "dice-tower", title: "Chop & Die Towers", group: "teams", mode: "challenge", seconds: 45,
    supplies: "Chopsticks or tongs, equal sets of large dice, and a stable table.",
    rules: [
      "Say: 'Build a skyline. Try not to sneeze.' Use chopsticks or tongs only; hands off the dice.",
      "Give everyone equal dice and time. Start 45 seconds; tallest tower still standing at time-up wins.",
      "For the five-dice prompt, race to stack five instead. Swap players next round."
    ],
    prompts: [
      { text: "Build the tallest standing dice tower in 45 seconds." },
      { text: "First to stack five dice wins!" }
    ]
  },
  {
    id: "in-out", title: "In-N-Out Circle", group: "group", mode: "challenge", seconds: 60,
    supplies: "A roomy circle marked with tape or soft markers, not trip hazards.",
    rules: [
      "Say: 'Follow the word, not the crowd!' Caller stands outside the marked circle and looks away.",
      "Call IN or OUT, including repeats. Players step to the correct side. A mistake means sitting out this round.",
      "Last player standing wins. Timer optional; shrink the circle only while there is safe space.",
      "Step, don't jump. Seated players can move their hands in/out instead; keep markers trip-free."
    ],
    prompts: [
      { text: "Caller says IN or OUT.\nListen carefully: repeated commands count!" },
      { text: "Practice round: IN, IN, OUT, IN, OUT, OUT!" }
    ]
  },
  {
    id: "scattergories", title: "Scattergories Sprint", group: "group", mode: "challenge", seconds: 60,
    supplies: "Each player's phone, your existing WhatsApp group, and the shared screen.",
    timeUpMessage: "Time's up! Send your three answers to the WhatsApp group now. The host checks answers and scores.",
    rules: [
      "Say: 'Be original. Your bestie's answer could cancel yours!' Choose Random category or Next category. Name three things; no starting-letter rule.",
      "Start 60 seconds. Each person types three different answers in ONE WhatsApp message. Keep it UNSENT; no discussing or copying.",
      "At SEND TO WHATSAPP, tell everyone to send together. Call the cutoff: no late additions or edits.",
      "Award one point per valid answer nobody else sent, max three. Matches across players cancel; repeats in your own message count once.",
      "You check messages and keep individual scores. The site cannot read, send or score WhatsApp messages."
    ],
    prompts: [
      { text: "Name three Taylor Swift songs." },
      { text: "Name three football (soccer) clubs." },
      { text: "Name three Formula 1 drivers, past or present." },
      { text: "Name three tennis players, past or present." },
      { text: "Name three sitcoms." },
      { text: "Name three animated movie characters." },
      { text: "Name three superheroes." },
      { text: "Name three board games." },
      { text: "Name three movies with a number in the title." },
      { text: "Name three fictional places from films, books or TV." },
      { text: "Name three apps you would hate to lose for a day." },
      { text: "Name three countries in South America." },
      { text: "Name three European capital cities." },
      { text: "Name three Indian states." },
      { text: "Name three languages spoken in India." },
      { text: "Name three planets in our solar system." },
      { text: "Name three musical instruments." },
      { text: "Name three sports played at the Summer Olympics." },
      { text: "Name three dog breeds." },
      { text: "Name three video streaming services." },
      { text: "Name three car manufacturers." },
      { text: "Name three video-game franchises." },
      { text: "Name three Harry Potter characters." },
      { text: "Name three animated Disney or Pixar movies." },
      { text: "Name three Indian playback singers." },
      { text: "Name three authors of published books." },
      { text: "Name three famous real-world landmarks." },
      { text: "Name three airlines." },
      { text: "Name three chemical elements from the periodic table." },
      { text: "Name three clothing brands." }
    ]
  },
  {
    id: "count-together", title: "Count & Squat", group: "group", mode: "challenge", seconds: 60,
    supplies: "A circle and enough space. Sitting or raising a hand works too.",
    rules: [
      "Say: 'Count together. Absolutely no organising the chaos!' Start at ONE; a different person says each number.",
      "After speaking, squat, sit or raise a hand for the rest of that attempt.",
      "No plans, signals or fixed order. Two voices at once? Everyone resets to ONE.",
      "Get everyone counted to win together. Timer optional."
    ],
    prompts: [
      { text: "Start at ONE.\nOne voice, one number, one person at a time." },
      { text: "No planning or signals!\nCan everyone finish this time?" }
    ]
  },
  {
    id: "camera-catch", title: "Moon Ball Camera Catch", group: "group", mode: "challenge", seconds: 45,
    supplies: "A soft ball and, only with everyone's consent, a phone camera.",
    rules: [
      "Say: 'Pass the ball. Dodge your documentary debut!' Get everyone's recording consent; the site never uses your camera.",
      "Seat the camera player in the middle, stationary. Looking away can replace a blindfold.",
      "Start 45 seconds. Others gently pass or bounce the soft ball, trying to stay out of the phone's view.",
      "No throws toward the seated player, collisions or moving blindfolded. Watch the clip together; delete it unless everyone wants to keep it."
    ],
    prompts: [
      { text: "Pass the soft ball around the circle.\nCan you escape the camera?" },
      { text: "Gentle-bounce round: keep the middle player stationary." }
    ]
  },
  {
    id: "reverse-charades", title: "Reverse Charades", group: "teams", mode: "secret", seconds: 45,
    supplies: "No props. One guesser per team.",
    rules: [
      "Say: 'One guesses. The rest become a very chaotic theatre company!' Pick one guesser and equal actor counts per team.",
      "Guessers look away. Show actors the secret scene, then HIDE it before guessers turn back.",
      "Start 45 seconds. Actors mime together; no words, singing or spelling letters.",
      "Correct before time-up = one point. You score; rotate roles and extras next scene."
    ],
    prompts: [
      { text: "An orchestra discovering that nobody is following the conductor" },
      { text: "Passengers trying to keep their balance on a very bumpy bus ride" },
      { text: "Going through airport security" },
      { text: "A cricket team celebrating a win" },
      { text: "Cooking a meal when everything goes wrong" },
      { text: "A surprise birthday party" },
      { text: "A family fighting over the TV remote" },
      { text: "A sports crowd reacting to a terrible referee decision" },
      { text: "A wedding dance group forgetting the steps" },
      { text: "An entire family reacting to a power cut" },
      { text: "Campers trying to put up a tent in strong wind" },
      { text: "Friends assembling furniture without instructions" },
      { text: "A group pretending to understand modern art" },
      { text: "People stuck in a lift with someone singing badly" },
      { text: "Wedding guests spotting the dessert buffet" },
      { text: "A rowing team paddling in completely different directions" },
      { text: "Astronauts trying to eat a meal in zero gravity" },
      { text: "A tour group realising their guide is completely lost" },
      { text: "A magician and assistants discovering the disappearing trick has failed" },
      { text: "Supermarket staff struggling with a checkout conveyor that keeps speeding up" },
      { text: "A royal court accidentally bowing to the wrong person" },
      { text: "Restaurant waiters delivering every dish to the wrong table" },
      { text: "Train passengers realising they have all missed their stop" },
      { text: "Pirates searching for treasure with their map upside down" },
      { text: "A film crew trying to finish a scene while every actor keeps laughing" },
      { text: "Hotel staff preparing for a very demanding VIP guest" },
      { text: "Zombies attending their first aerobics class" },
      { text: "A colony of penguins huddling together in a snowstorm" },
      { text: "Scientists watching their experiment produce something completely unexpected" },
      { text: "A classroom hiding its mischief just as the teacher walks in" }
    ]
  },
  {
    id: "five-things", title: "Five Things in Ten Seconds", group: "teams", mode: "rapid", seconds: 330,
    roundSize: 30, guessSeconds: 10, revealSeconds: 0, transitionSeconds: 1, promptUnit: "prompt",
    example: { text: "Name five colours.", answer: "Red, blue, green, yellow, purple.", tip: "Say five different valid answers aloud within ten seconds. This practice prompt is not in the game." },
    intro: "One player at a time says five different valid answers aloud in ten seconds. All five earn one point; fewer than five earn zero. No teammate help. The host judges and scores manually.",
    lineGuide: "Alternate teams, sending the next player from each team's queue. After ten seconds, a full-screen NEXT! cue lasts one second, then a fresh prompt starts automatically. Pause if changing players or judging needs longer.",
    supplies: "No props.",
    rules: [
      "Say: 'Five answers. Ten seconds. Suddenly every word has vanished!' Alternate teams; only the called player speaks.",
      "Press START for 30 shuffled prompts. Name five DIFFERENT valid answers aloud in 10 seconds; no repeats or teammate help. The order shuffles once per visit and stays fixed while playing.",
      "All five = one point; fewer = zero. You judge and score. At the 1-second NEXT!, switch players; the next prompt starts automatically. Pause if needed.",
      "Ask Ash to confirm personal facts/favourites; any order is fine. For imaginary reactions or plans, accept plausible, kind answers. There is no built-in answer key.",
      "Keep answers cheeky, not cruel; anyone can pass.",
      "Give teams equal scored turns; leftover prompts are unscored bonuses. Most points wins, ties can share."
    ],
    prompts: [
      { text: "Name five things Indian moms say when scolding." },
      { text: "Name five things you'll find in every Indian household." },
      { text: "Name five Indian street foods." },
      { text: "Name five things Indian aunties will judge you for." },
      { text: "Name five Bollywood villains." },
      { text: "Name five Bollywood songs that make everyone dance." },
      { text: "Name five things Indian dads say while driving." },
      { text: "Name five foods you'd order at 2 AM on Swiggy." },
      { text: "Name five things Ash would do if he won the lottery." },
      { text: "Name five things people pretend to understand." },
      { text: "Name five things Indian parents say when guests are coming over." },
      { text: "Name five things you'd find at an Indian wedding." },
      { text: "Name five excuses Indian kids give their parents." },
      { text: "Name five things people do when the bill arrives." },
      { text: "Name five things Ash would complain about on holiday." },
      { text: "Name five Bollywood characters you'd invite to a party." },
      { text: "Name five things you shouldn't Google in front of your parents." },
      { text: "Name five things people do when they think nobody is watching." },
      { text: "Name five foods you'd fight your sibling for." },
      { text: "Name five ways to recognize someone from Bandra or a pretentious city person." },
      { text: "Name five things Dr. Mahendra Watsa would have advice for." },
      { text: "Name five celebrities you'd want to gossip with." },
      { text: "Name five things that should stay between couples." },
      { text: "Name five lies people tell on their dating profiles." },
      { text: "Name five things people say after two drinks." },
      { text: "Name five questions Indian relatives ask after your wedding." },
      { text: "Name five excuses people give for not replying on WhatsApp." },
      { text: "Name five things people hide before their parents visit." },
      { text: "Name five things friends argue over on a Goa trip." },
      { text: "Name five things you say when your crush walks in." }
    ]
  },
  {
    id: "hand-map", title: "Hand & Fist Map", group: "group", mode: "quiz", seconds: 60,
    supplies: "Your own hands; a table is optional.",
    handMap: [["palm", "circle"], ["circle", "circle"], ["circle", "palm"], ["palm", "palm"]],
    rules: [
      "Say: 'Your hands have one job. Let's see how that goes.' Follow the four rows top to bottom, using left/right as labelled.",
      "Round 1: handprint = open palm; circle = fist. Round 2: swap the meanings, not the map.",
      "Next prompt changes rounds; Reveal answer checks the sequence. Play at your pace or start the optional 60-second timer.",
      "Hold hands up or rest them on your own table, not the TV. You judge mistakes; a silly pose or sitting out is optional. Anyone may pass."
    ],
    prompts: [
      { text: "Round 1: Match the map\nHandprint = open palm. Circle = closed fist.", answer: "Left / Right\nPalm / Fist\nFist / Fist\nFist / Palm\nPalm / Palm" },
      { text: "Round 2: Opposite Hands\nHandprint = closed fist. Circle = open palm.", answer: "Left / Right\nFist / Palm\nPalm / Palm\nPalm / Fist\nFist / Fist" }
    ]
  }
];
