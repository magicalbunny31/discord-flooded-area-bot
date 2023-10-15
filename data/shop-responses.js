import dayjs from "dayjs";
import { hyperlink, time, TimestampStyles } from "discord.js";
import { emojis, choice, strip } from "@magicalbunny31/awesome-utility-stuff";

export default {
   "shop-items": {
      halo: {
         colour: 0x9000ff,
         get welcome() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_halo} waaa..
                  ${emojis.currency_shopkeeper_halo} so eepy..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} bunny says he never sleeps on the job but..
                  ${emojis.currency_shopkeeper_halo} look at him, he's soo adorable when he's sleeping..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} now it's my turn to play shopkeeper!!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} what's the weather like up there?
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} hii~
                  ${emojis.currency_shopkeeper_halo} welcome to cutie's shop
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} im so silly :3
                  ${emojis.currency_shopkeeper_halo} im so silly :3
                  ${emojis.currency_shopkeeper_halo} im silly :3333333
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i know something about bunny you don't :3
               `
            ]);
         },
         get viewing() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_halo} this one has been at on shelves for too long
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} but i like that onee..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i dont care about this one please take it
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} ooo..
                  ${emojis.currency_shopkeeper_halo} good choice!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} can i go back to cuddling cutie after this?
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} we accept coins, comets and dollar bucks
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} the last one in stock too!
               `
            ]);
         },
         get purchase() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_halo} thank you for the dollar bucks!!
                  ${emojis.currency_shopkeeper_halo} you have a safe journey now!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} do you want an umbrella too?
                  ${emojis.currency_shopkeeper_halo} it looks like a thunderstorm is coming..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} can i go get a drink now
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} *cutie cutie cutie!!*
                  ${emojis.currency_shopkeeper_halo} *wake up i did a thing!!*
                  ${emojis.currency_shopkeeper_bunny} hm..~ ..huh? oh.... *snore mimimimi*
               `
            ]);
         }
      },

      bunny: {
         colour: 0xffc832,
         get welcome() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} yeah, this is the same place as usual
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} what do you want?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} you get 🪙 \`1\` coin whenever you send a message, every minute!
                  ${emojis.currency_shopkeeper_bunny} ..so what are you waiting for? send a message already duh
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} zzz~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} asleep on the job?
                  ${emojis.currency_shopkeeper_bunny} i would never!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hurry up, i have a ticket to deal with
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} ruby recently took control of the flea market
                  ${emojis.currency_shopkeeper_bunny} go check it!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} you guys buy too many bunny plushies
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i am NOT a protogen!
                  ${emojis.currency_shopkeeper_bunny} i'm a folf! a fox-wolf!
                  ${emojis.currency_shopkeeper_bunny} one's a robot and the other's a literal animal: there's a BIG difference!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} why is there a black market for test items?
                  ${emojis.currency_shopkeeper_bunny} i just don't get the deal with them
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hello, chat!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} what's up?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} why did the chicken cross the road?
                  ${emojis.currency_shopkeeper_bunny} ..why are you telling me this?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} don't tell anyone but i stole something from one of the mods
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} why am i saying stuff?
                  ${emojis.currency_shopkeeper_bunny} well, it's a reference to a particular game~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} dm me a fox pic and i'll give you a few coins
                  ${emojis.currency_shopkeeper_bunny} trust
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i sell your items here does it look like i'm your personal maid
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} without me, this place would be in total ruin
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} don't step on the protogen oomba on your way out
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} am i....meant to be welcoming?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} you'll be surprised at how many furries there are in this server,
                  ${emojis.currency_shopkeeper_bunny} ..don't ask why i know that
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hai!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hewwo!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} meowdy!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hi! hello! howdy!
                  ${emojis.currency_shopkeeper_bunny} what can i do ya for today?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} one time, someone replaced my bread with a piece of explosive bread
                  ${emojis.currency_shopkeeper_bunny} my jaw hurt afterwards
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} big explosive?
                  ${emojis.currency_shopkeeper_bunny} what is this? flooded area?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} this is the wrong shop to buy perks buddy
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i don't accept robux here sorry
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} did you know that you get 🪙 \`2\` coins per message during the weekend?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} no, you may not hold my tail thanks
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i'm just as thrilled to be here as much as you are
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} NO refunds!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} if you see halo around during the daytime, tell her she's cute
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} did you hear about the drama the other day?
                  ${emojis.currency_shopkeeper_bunny} yeah, apparently someone pinged everyone!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} take good care of yourself
                  ${emojis.currency_shopkeeper_bunny} please
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} explosive shocks are not a valid payment method
                  ${emojis.currency_shopkeeper_bunny} how did you get your hands on that anyway?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} come on in!
                  ${emojis.currency_shopkeeper_bunny} i have...."things" for you~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} who buys these stuff?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} the special items here never rotate,
                  ${emojis.currency_shopkeeper_bunny} that means you can buy them at any time you like!
                  ${emojis.currency_shopkeeper_bunny} who knows, maybe an exclusive item will appear there~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i don't trust the stalk market here
                  ${emojis.currency_shopkeeper_bunny} it's too much of a "get rich quick" simulator to me
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} oh, it's you again!
                  ${emojis.currency_shopkeeper_bunny} have a look, will ya?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} welcome!
                  ${emojis.currency_shopkeeper_bunny} take a look, no rush, no rush
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} try ${hyperlink(`Tide Rush 2 🌊`, `https://www.roblox.com/games/8936217743/Tide-Rush-2`)} whilst you're here!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} offer halo something and she'll literally do your job for you
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} what's the weather like down there?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i've got dirt on one of the developers
                  ${emojis.currency_shopkeeper_bunny} wanna hear about it? that'll be 4 coins please
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} items, items, items..
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} is this what shop work is like..
                  ${emojis.currency_shopkeeper_bunny} ..every day?!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} a shop for a discord server?
                  ${emojis.currency_shopkeeper_bunny} no, that's ridiculous..
                  ${emojis.currency_shopkeeper_bunny} why would i spend so long on something like that?!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} there's so much talk about "gardening" when you retire
                  ${emojis.currency_shopkeeper_bunny} kit, just do what you love best~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} who decided to build on these lands?
                  ${emojis.currency_shopkeeper_bunny} surely they recognise the area will in fact flood!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} you sure look tired after surviving rounds of areas flooding
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} buy one, get none free!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} niko once told me pancakes is a command
                  ${emojis.currency_shopkeeper_bunny} it's....not a slash command, what did they mean by that?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} do you think peri knows how to make toast?
                  ${emojis.currency_shopkeeper_bunny} i'm hungy xwx
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i think ruby's stolen one of my items again
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} someone tell oxy to stop abusing the stalk market
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} it's scotty, not scottie
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} krakowski is such a cool name
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} erm, what the tuna?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} raphael ate ALL my balls and now i'm sad
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i should talk to blizzard more >w>
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} where's puppy dogruk 22 when you need him?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} #hugo2023
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} ..waiting for the day welololol visits my shop~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} arla's tacos are probably the most sought after item since she doesn't restock like ever
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i'm on the fence whether to call him "yourstruly" or "MWMWMWMWMWMWMWMWMWMW"
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} MIMI!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} d'ya know when was the last time melody showed up here?
                  ${emojis.currency_shopkeeper_bunny} ..oh, that was more of a rhetorical question
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} my basement's exit is covered with le tape and lucrs is finding it hard to escape
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} okko precious
                  ${emojis.currency_shopkeeper_bunny} no touchies
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} me on my gay little paws
                  ${emojis.currency_shopkeeper_bunny} with my big gay ears
                  ${emojis.currency_shopkeeper_bunny} being gay
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} welcome to my shop!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} rawr ,':3
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} halo is a cutie~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} halo takes over during the daytime while i fall into slumber
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} at least halo doesn't has a broken sleeping schedule..
                  ${emojis.currency_shopkeeper_bunny} ..unlike me..
               `
            ]);
         },
         get viewing() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} ooh, that looks nice!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} no way
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i want that too
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} excellent choice!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i NEED that
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hot off the stove!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} going once, going twice..
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} get it before it's gone!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} what a beaut!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} oh, you want that?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} what do you think?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} it looks artificial
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} are you sure that's real?
                  ${emojis.currency_shopkeeper_bunny} it doesn't look like it is
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} found something?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} something's caught your eye?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} made lovingly by paw!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hmm?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i didn't know i was selling that
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} where did that come from?!
               `
            ]);
         },
         get purchase() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} thanks for supporting!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thanks for buying!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} you come back now!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thank you for your purchase!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thank you kindly for your purchase!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thanks much!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} awh, thanks a bunch!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} come back again!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} enjoy!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} here's your item!
                  ${emojis.currency_shopkeeper_bunny} you take care now~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} i appreciate it~
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} hope it's useful!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thanks!
                  ${emojis.currency_shopkeeper_bunny} ..now, what're ya gun do with that?
               `
            ]);
         }
      },

      haloBunny: {
         colour: 10 <= dayjs.utc().hour() && dayjs.utc().hour() < 22
            ? 0x9000ff  // halo's colour  : 10:00 - 21:59 : 0x9000ff
            : 0xffc832, // bunny's colour : 22:00 - 09:59 : 0xffc832
         get welcome() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} call halo cute
                  ${emojis.currency_shopkeeper_bunny} NOW!
                  ${emojis.currency_shopkeeper_halo} NO
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} hey you should call bunny cute now!
                  ${emojis.currency_shopkeeper_bunny} nuh uh
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} ....
                  ${emojis.currency_shopkeeper_bunny} hold on i need to sort halo out rq
                  ${emojis.currency_shopkeeper_halo} waa
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} hi chat
                  ${emojis.currency_shopkeeper_halo} hi ruby
                  ${emojis.currency_shopkeeper_bunny} GET OUT OF MY SHOP
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} \\*distant crash\\*
                  ${emojis.currency_shopkeeper_bunny} ..ignore that, she's found the keys to the back
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} wake up cutie it's ${time(dayjs().unix(), TimestampStyles.ShortTime)}, time for your daily software update
                  ${emojis.currency_shopkeeper_halo} yes cutie
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} trees are real
                  ${emojis.currency_shopkeeper_bunny} huh
                  ${emojis.currency_shopkeeper_halo} how
                  ${emojis.currency_shopkeeper_bunny} 🐱❓
                  ${emojis.currency_shopkeeper_halo} i will cherish this moment forever
                  ${emojis.currency_shopkeeper_bunny} QHAR?!?!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} welcome~
                  ${emojis.currency_shopkeeper_halo} hey!
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} we must cook.
                  ${emojis.currency_shopkeeper_halo} cutie are you alright
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} \\*boops\\*
                  ${emojis.currency_shopkeeper_halo} missed me!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} ..
                  ${emojis.currency_shopkeeper_bunny} ..we'll be with you in a sec!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} ..so eepy..
                  ${emojis.currency_shopkeeper_bunny} ..and cute..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} chicken sandwich
                  ${emojis.currency_shopkeeper_bunny} true
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} the fucking seagulls are back to squawk and haunt me
                  ${emojis.currency_shopkeeper_halo} run
                  ${emojis.currency_shopkeeper_bunny} run where
                  ${emojis.currency_shopkeeper_halo} uh uh uh uh uh idk uh air
                  ${emojis.currency_shopkeeper_bunny} i'm afraid the seagulls have air too
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} zzz
                  ${emojis.currency_shopkeeper_bunny} wake up
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i have one purpose in life and--
                  ${emojis.currency_shopkeeper_bunny} *AHEM*
                  ${emojis.currency_shopkeeper_bunny} ..uhm, anyway, hi visitor!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} is it just toasters that die when called cute or..
                  ${emojis.currency_shopkeeper_bunny} ${emojis.boop}
                  ${emojis.currency_shopkeeper_halo} ..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} welcome to the void!
                  ${emojis.currency_shopkeeper_bunny} hai hai!
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i'm a sneaky proto
                  ${emojis.currency_shopkeeper_halo} i sneaked in your house
                  ${emojis.currency_shopkeeper_halo} sat on your couch
                  ${emojis.currency_shopkeeper_halo} ate your usbs
                  ${emojis.currency_shopkeeper_halo} went thru your search history
                  ${emojis.currency_shopkeeper_bunny} WAIT NOO GET OFF MY LAPTOP
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} oh i love gex!
                  ${emojis.currency_shopkeeper_bunny} ${emojis.woah}
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} did i tell you about the time i fell down the stairs?
                  ${emojis.currency_shopkeeper_halo} again?
               `
            ]);
         },
         get viewing() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} buy this and i call her cute
                  ${emojis.currency_shopkeeper_halo} do not buy this item
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} but i like this item..
                  ${emojis.currency_shopkeeper_bunny} name your price.
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} hey if you buy this item i'll boop the cutie a lot
                  ${emojis.currency_shopkeeper_bunny} do NOT buy this item i beg thee
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i mean at least it's not an off-brand
                  ${emojis.currency_shopkeeper_bunny} what's wrong with them? i love them
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} this item scares me
                  ${emojis.currency_shopkeeper_bunny} it'll be fine
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} you must be nuts to buy this
                  ${emojis.currency_shopkeeper_bunny} uhm..
               `
            ]);
         },
         get purchase() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_bunny} please don't give this item to ruby
                  ${emojis.currency_shopkeeper_halo} cutie it'll be fine trust
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} ..uhm, where did we get this item from again?
                  ${emojis.currency_shopkeeper_halo} shrug
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} WE MADE BANK !!
                  ${emojis.currency_shopkeeper_halo} W
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} i think its about to rain..
                  ${emojis.currency_shopkeeper_bunny} oh? uh, you'll be fine....right?
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} thank you !!
                  ${emojis.currency_shopkeeper_halo} ..cutie....
                  ${emojis.currency_shopkeeper_bunny} ..now, if you'll excuse me..
               `,
               strip`
                  ${emojis.currency_shopkeeper_halo} brain....no..work..
                  ${emojis.currency_shopkeeper_bunny} hush hush, the hard work is over now..
                  ${emojis.currency_shopkeeper_bunny} be eepy..
               `
            ]);
         }
      }
   },

   get "special-items"() {
      return this[`shop-items`];
   },

   "flea-market": {
      ruby: {
         colour: 0xf371d4,
         get welcome() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_ruby} sentimental value included!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} what's good here is that you don't pay tax on these items
                  ${emojis.currency_shopkeeper_ruby} bunny's shop, however, does!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} boop haiii
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i may be retired but i still enjoy this place 
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} if you find any issues here just call bunny
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i msobing
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} r
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i forgot
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} did you know that you can get free flood coins by...
                  ${emojis.currency_shopkeeper_ruby} click to read more
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} that oomba's name is "rowan"
                  ${emojis.currency_shopkeeper_ruby} "oomba" is just the name of rowan himself
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} ..what's a "roomba"?
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} boom! i'm here!
                  ${emojis.currency_shopkeeper_ruby} you can't get rid of me!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} flooded area fell off
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} buy buy buy buy buy buy buy buy buy buy buy buy buy 
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} 90% of the gamblers quit before they win big
                  ${emojis.currency_shopkeeper_ruby} so what are you waiting for? buy some carrots at the stalk market! (after you waste your coins here of course)
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} hi chat
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i wonder when the flooded area devs will actually listen to my suggestions..
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} how long has it been since my demotion
               `,
               strip`
                  ${emojis.currency_shopkeeper_bunny} <this response has been filtered by bunny>
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} guh
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A! I HATE FLOODED A!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} if seller = rapidrub then buy
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} silly !
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} zzzzzzz
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} these deals are good buy them while you can
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} press ctrl+r now
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i'm doing this for free man i don't even earn money from this i msobing
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} i love fle markwt
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} \u200b🌘 〰️ 🌒
               ` // \u200b to make the emojis not big
            ]);
         },
         get viewing() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_ruby} i remember seeing this in bunny's shop!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} please take this item it's right there
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} do NOT steal !!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} click the buy button
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} buy it
                  ${emojis.currency_shopkeeper_ruby} i dare you
                  ${emojis.currency_shopkeeper_ruby} do it
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} what are you looking at?
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} is that yet another test item or something
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} this is a good deal buy it NOW!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} buy
               `
            ]);
         },
         get purchase() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_ruby} treat that item well!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} thanks - i'll send these coins to them now!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} give it a nice new home!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} :3
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} waaaaa thank chuu
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} pawesome!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} good business!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} \\:happ\\:
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} that's swag!!
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} come back again!
                  ${emojis.currency_shopkeeper_ruby} pleaseeeee
               `,
               strip`
                  ${emojis.currency_shopkeeper_ruby} ty ty ty!!
               `
            ]);
         }
      }
   },

   "stalk-market": {
      deerie: {
         colour: 0x796853,
         get welcome() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_deerie} market crashers: discord style!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} i have no idea what bunny is saying but you can totally trust me
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} let's hope the economy doesn't crash now..
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} you don't get taxed for being a stalkbroker, unlike buying things from bunny's shop
                  ${emojis.currency_shopkeeper_deerie} they'll tax your coins and take them for themselves! how selfish
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} remember to sell your carrots by next week!
                  ${emojis.currency_shopkeeper_deerie} ..why? they'll rot!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} sell these at the right price!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} these premium carrots are only sold in bunches of 1, kitto
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} carrying on a legacy!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} turning over a new leaf!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} looking over the new horizons!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} instead of walking around the server carrying a bag full of carrots you can come here instead
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} buying from me?
                  ${emojis.currency_shopkeeper_deerie} well, i sell carrots in bunches of 1~
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} welcome to the carrot farm!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} selling or buying?
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} checking on our prices?
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} lovely day out here, huh?
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} it's carrot season!
                  ${emojis.currency_shopkeeper_deerie} today, tomorrow, and every day!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} carrots are a *safe* investment!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} i cannot be held accountable for how the market will act
               `
            ]);
         },
         get buy() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_deerie} have a good one!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} enjoy those stalks!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} take good care of those carrots!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} remember: the carrots will become rotten next sunday!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} good luck out there kitto!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} hopefully the stalk market treats you well!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} ..try not to eat these beautiful carrots!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} thanks for supporting local businesses!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} see you in the coming days!
               `
            ]);
         },
         get sell() {
            return choice([
               strip`
                  ${emojis.currency_shopkeeper_deerie} thank you for the carrots!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} ..don't ask why i'm buying these carrots *back* after selling them to you
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} now pray that was the right choice!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} thanks for these scrumptious carrots!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} here's your payment!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} have a good day!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} was nice bargaining with you!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} see you next sunday!
               `,
               strip`
                  ${emojis.currency_shopkeeper_deerie} safe choice!
                  ${emojis.currency_shopkeeper_deerie} i applaud all my sellers~
               `
            ]);
         }
      }
   }
};