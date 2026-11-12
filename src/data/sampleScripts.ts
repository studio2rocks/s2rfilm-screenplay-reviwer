import { ScriptMetadata } from '../types/script';

export interface SampleScript {
  id: string;
  metadata: ScriptMetadata;
  content: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'glass-meridian',
    metadata: {
      title: 'THE GLASS MERIDIAN',
      author: 'Evelyn Vane & J. Mercer',
      genre: 'Neo-Noir / Corporate Espionage',
      targetFormat: 'Feature Film',
      estimatedPages: 112,
      logline: 'When an obsessive forensic auditor discovers that a trillion-dollar green-energy consortium is laundering phantom carbon credits through offshore orbital satellites, her whistleblowing partner is assassinated—leaving her 48 hours to expose the board before their artificial blackout weapon activates.',
      authorStatement: 'A razor-sharp examination of algorithmic greed and ethical erosion in contemporary late-stage green capitalism. Grounded in actual financial mechanics, avoiding high-tech tropes in favor of sweaty, claustrophobic boardroom suspense.',
      draftDate: 'November 2026'
    },
    content: `FADE IN:

EXT. SAN PEDRO CONTAINER TERMINAL - DUSK

Fog rolls over mountains of rusted steel shipping containers. Gantry cranes tower like skeletal iron giants against a bruised purple sky.

Rain spits against the cracked windshield of a 2018 Toyota Camry.

INT. TOYOTA CAMRY - CONTINUOUS

ELENA MENDOZA (38) sits behind the steering wheel. Sharp bone structure, rimless titanium reading glasses. She hasn't slept in thirty-six hours and it shows in the hard twitch along her jaw.

On the passenger seat, an old Panasonic Toughbook glows. Rows of SHA-256 cryptographic hashes tick down in neon green.

She taps the steering wheel. Drumming an impatient, syncopated rhythm.

The passenger door rips open.

MARCUS CHEN (42) dives inside, soaking wet, his heavy wool overcoat smelling of sea brine and diesel exhaust. He slams the door shut.

ELENA
You're nine minutes late.

MARCUS
(gasping)
Security at Berth 40 wasn't private security, Elena. They were wearing Baltic tactical gear. Black uniforms, no insignia.

ELENA
Did you pull the physical drive?

Marcus reaches inside his sodden coat. Pulls out a heavy, water-sealed aluminum chassis. The blue LED blinks frantically.

MARCUS
It's the actual ledger from the Zurich node. Unencrypted.

ELENA
Let me see it.

MARCUS
Before I give it to you—promise me. We don't go to the SEC.

Elena pauses, her fingers hovering inches from the aluminum casing.

ELENA
The SEC has six commissioners with direct stock options in Meridian Horizon. I'm not an idiot, Marcus. We deliver it to the federal prosecutor in Brooklyn.

MARCUS
No. The prosecutor's brother heads Meridian's venture syndicate. The rot isn't a leak. It's the whole plumbing.

Marcus stares out the steamed-up window. His breathing is shallow, rapid.

MARCUS (CONT'D)
They're not trading carbon credits to hide money. They're falsifying the regional grid load to trigger the rolling brownouts in Osaka and Munich.

ELENA
Why?

MARCUS
Because every time a municipal grid drops below forty-five hertz, Meridian's algorithmic futures contract pays out three hundred million dollars automatically. It's an automated extortion loop.

HEADLIGHTS illuminate the Camry's rearview mirror. High beams cut through the rain.

A matte-black Suburban idles thirty yards behind them. No license plate.

ELENA
Marcus. Put your seatbelt on.

MARCUS
They tracked the MAC address on the Zurich node. They know it's unsealed.

ELENA
Seatbelt. Now.

Elena drops the Camry into reverse, slams the accelerator, and spins the wheel. The tires scream on wet asphalt.

EXT. CONTAINER TERMINAL - CONTINUOUS

The Camry slides backward between two towering stacks of Maersk containers. The black Suburban surges forward, its heavy push-bumper grinding sparks against the concrete apron.

SMASH!

The Suburban clips the rear quarter-panel of the Camry. Glass explodes onto the tarmac.

Elena recovers, shifts into drive, and punches through a line of orange safety bollards toward the harbor gate.

INT. TOYOTA CAMRY - CONTINUOUS

Marcus grips the dashboard. The Toughbook screen is glitching.

MARCUS
Elena! The gate is closed!

Elena doesn't brake. Her eyes lock onto the hydraulic barrier arm sixty yards ahead.

ELENA
Hold that drive against your chest.

MARCUS
You can't ram five inches of forged steel—

ELENA
I'm not aiming for the arm. I'm aiming for the guard shack power transformer.

She wrenches the wheel hard left.

CUT TO BLACK.`
  },
  {
    id: 'echo-drift',
    metadata: {
      title: 'ECHO DRIFT',
      author: 'David Thorne',
      genre: 'Sci-Fi Psychological Thriller',
      targetFormat: 'Feature Film',
      estimatedPages: 104,
      logline: 'Stationed alone on a decommissioned deep-space communication array orbiting Saturn, an isolated engineer begins intercepting distress transmissions that perfectly predict her own immediate future—including her recorded murder by a visitor who has not yet arrived.',
      authorStatement: 'A hard sci-fi study of radical isolation, grief, and determinism. Zero artificial gravity theatrics; emphasis on tactile analog machinery, acoustic dread, and psychological decay.',
      draftDate: 'October 2026'
    },
    content: `EXT. DEEP SPACE - SATURN ORBIT

Silence. Total and absolute.

The pale golden rings of Saturn stretch across the void like a colossal vinyl record caught in amber sunlight.

Suspended three thousand kilometers above the B-ring floats ARRAY 14: an ancient spool of solar spars, rusted thermal radiators, and a kilometer-wide parabolic dish.

SUPER: ARRAY 14 - DAY 842 OF RETIREMENT PROTOCOL

INT. ARRAY 14 - HABITATION MODULE - CONTINUOUS

DR. TESS VANCE (34) floats in microgravity. Her dark hair is gathered in a messy braid. Her knuckles are bruised, taped with athletic cloth.

She is carefully tightening a stripped hex bolt on an acoustic sensor array using a magnetic torque wrench.

CLICK. CLICK.

Her personal audio system plays low, melancholic analog cello music.

COMPUTER (V.O.)
(flat, synthesized chime)
Dr. Vance. Incoming telemetry packet on carrier frequency nine-point-four.

Tess doesn't look up from her wrench.

TESS
Ignore it, Echo. It's solar flare scatter from Jupiter.

COMPUTER (V.O.)
Signal characteristics are non-stochastic. Source origin coordinates: Vector zero-two-four. Distance: forty-one kilometers.

Tess freezes. Her wrench slips, floating gently away toward the air scrubber vent.

TESS
There is nothing on vector zero-two-four. That's dead orbital declination.

COMPUTER (V.O.)
Packet contains analog audio modulation. Decibel profile indicates human vocal cord vibration.

Tess pushes off the bulkhead and glides across the cramped cabin to the communications console.

Old cathode-ray tubes flicker green. Dual audio reels spin up with a mechanical clatter.

She grabs a pair of heavy bakelite headphones, presses them to her ears.

AUDIO PLAYBACK (STATIC AND HISS):

WOMAN'S VOICE (ON AUDIO)
(whispering, frantic)
...if you're hearing this... don't open airlock three. He says his heat pump failed... he's wearing an Apollo-era flight suit... but he knows your sister's name...

Tess pales. Her hand begins to tremble against the copper dial.

TESS
Echo. Run voice print analysis. Who is that?

COMPUTER (V.O.)
Voice print match is ninety-nine point eight percent congruent.

TESS
Congruent with whom?

COMPUTER (V.O.)
With you, Dr. Vance. Timestamp of transmission: tomorrow morning, zero-six-hundred hours.

A heavy, metallic THUD reverberates through the station's steel hull.

Three deliberate beats. Like a fist knocking on the exterior hatch of Airlock Three.

Tess slowly turns her head toward the dark corridor leading aft.

Silence returns. Then:

VISITOR (O.S.)
(through the hull, muffled)
Tess? It's Julian. My auxiliary thruster blew out near Enceladus. Open up, please. It's freezing out here.`
  },
  {
    id: 'burnt-umber',
    metadata: {
      title: 'BURNT UMBER',
      author: 'Clara Delacroix',
      genre: 'Indie Dramedy / Family Saga',
      targetFormat: 'Feature Film',
      estimatedPages: 98,
      logline: 'Following the sudden death of their eccentric, hoarder artist father, three estranged siblings gather at his crumbling Hudson Valley studio to catalog hundreds of unsigned paintings—only to discover an uncashed will leaving the entire multimillion-dollar estate to their father’s bitterest critic.',
      authorStatement: 'A bittersweet ensemble tragicomedy about artistic legacy, middle-aged resentment, and how families weaponize memory. Naturalistic Cassavetes-style dialogue with rich subtext and comedic rhythm.',
      draftDate: 'December 2026'
    },
    content: `INT. DELACROIX ATELIER - HUDSON VALLEY - DAY

Dust motes dance in cathedral-height shafts of winter sun.

Canvases are everywhere. Leaning ten deep against unfinished pine walls. Stacks of turpentine rags, yellowed Artforum magazines from 1984, and hundreds of dried paintbrushes stuffed into empty pickle jars.

MAYA (41) stands in the center of the mess holding an iPad like a shield. Sleek cashmere sweater, sensible boots, reading glasses perched on her forehead.

LEO (36) is sprawled on an ancient velvet chaise lounge, rolling an unlit cigarette between his fingers. He wears an oversized trench coat that smells of train stations.

MAYA
There are seven hundred and twelve canvases in this room alone.

LEO
He called it an archive.

MAYA
He called his tax delinquency a protest against imperialist road maintenance, Leo. That didn't stop the county from placing a thirty-thousand-dollar lien on the property.

LEO
You always calculate the property tax before you look at the brushwork.

MAYA
Someone had to pay for your tuition at RISD before you dropped out to become a artisanal roof slater.

The kitchen door bangs open.

SIMONE (29) enters carrying a cardboard box overflowing with empty bourbon bottles and unopened legal letters.

SIMONE
Good news and bad news.

MAYA
Start with bad.

SIMONE
Dad hasn't paid the oil bill since August. The pipes in the upstairs guest bath have the structural integrity of a sugar cone.

LEO
And the good news?

SIMONE
I found his secret stash of imported French sardines. And this.

She holds up a wax-sealed manila envelope. Across the front in wild, black calligraphy:

"LAST WILL AND INVENTORY OF GRIEVANCES - ARTHUR DELACROIX"

Maya reaches for it immediately.

MAYA
Give me that.

SIMONE
(pulling it back)
Wait. If we open this without a lawyer, does it void probate?

LEO
Dad hated lawyers more than he hated representational watercolorists. Just rip it.

Simone pulls open the flap. A thick handwritten sheaf of parchment slides out.

Maya reads over Simone's shoulder. Her expression collapses from exasperation into sheer, unadulterated shock.

LEO (CONT'D)
Well? Who gets the Hudson property?

MAYA
(choked)
Nobody.

LEO
What do you mean nobody?

MAYA
"To my beloved children, Maya, Leopold, and Simone: I leave you each one jar of unrefined burnt umber pigment, that you might learn the dignity of manual labor."

SIMONE
...And the real estate?

MAYA
"The house, the land, and all seven hundred and twelve paintings are hereby transferred in perpetuity to Arthur's foremost critic... Mr. Sterling Vance of the New York Times."

A long beat of absolute dead silence.

Leo suddenly bursts out laughing. A raw, hysterical, wheezing bark.

Maya turns on him, eyes blazing.

MAYA (CONT'D)
Do not laugh!

LEO
(wiping tears)
He trolled us from beyond the grave, Maya! He gave the house to the man who called his retrospective 'a tepid puddle of masturbatory acrylics'!

Simone drops the box of bourbon bottles. They shatter across the floor.`
  }
];
