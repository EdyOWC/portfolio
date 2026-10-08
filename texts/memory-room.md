This article is about the UX and world-building of Memory Room. For the piece about its content, see [the project page](/memory-room-vr).

Different objects act differently. We hold certain expectations toward lighters. We know what they can do and how they are used, and those expectations are nothing like the ones we hold for canvas photos, CDs or books. Any virtual reality experience with interactive objects has to answer those expectations, because they come from a lifetime of handling the real things.

An innovative experience, I think, is one that finds its own ways of letting us touch the environment. We can use one or more of the sensors and input systems to make players curious about the plot or the message. In Memory Room I used several input systems to involve the visitor. What follows is a walk through some of the interactive objects in the room.

## 1. The candle — proximity and microphone

When we see a candle in a space dedicated to someone, we look for matches or a lighter. I do not think that is only a pyromaniac urge. It is a way to take part without saying a word. So it is no surprise that people see a candle and go looking for something to light it with. Then we ask ourselves: how do I light a candle in real life? Simply. We press and hold the trigger with a thumb and bring the flame close to the wick.

If the virtual lighter has physical boundaries — a collider — we can grab it. If both the flame and the wick have colliders, making them touch activates the flame object and adds a little light at its base.

The sound matters too. Every lighter trigger makes a click at the start of the ignition, like a tiny explosion, followed by the woosh of the burn. As long as we hold the trigger that sound continues. Getting that right needs a script that separates the ignition sound from the burn.

@image assets/img/memory-room-lighter-sfx.png | Two sound events, not one: the click at the moment of ignition, then the burn looping for as long as the trigger is held.

Then there is putting it out. "How do we do it in real life?" is the question that led to the solution: if we are close enough and make a sound loud enough — at least a blow of air — the flame object is disabled. VR headsets now carry microphones that detect volume. With a more complex script you can detect not only proximity and loudness but the type of sound, excluding ordinary speech and prioritising an exhalation.

## 2. Notes, the will and others — grab to change the environment

Physical objects trigger memory. Seeing a bottle of wine, we remember buying it, or picture a vineyard. In reality that transformation is visible only to the person having it, who stays in the same room. In VR you can genuinely appear somewhere else by grabbing something. The grab is just one simple way to start the function that changes things. The real questions are: what action should start the transformation, why this object, and what kind of transformation.

Here is the breakdown from the project. We visit the most private place a person has to offer — his bedroom, where his work is. The player takes a note from a wall of personal quotes and poems, looks at it, takes two more, and then moves into another environment. That environment is about a fragile ego: more work, more doubt about success, more symbols of loneliness and failure. The fact that the player pulled the notes off the wall, read each briefly and moved to the next has everything to do with how my ego is shown in that second place. All my life people have looked at my work for a second and carried on. So grabbing is a good and simple action to start the transformation — specifically grabbing not one note but three. By then people are pulling notes down just for fun. That collection answers the second question: from creation to inner world. The notes are windows into my world. As for the transformation itself, when we grab the third note we pop into the new environment while still holding it, which is the clue to what put us there. Even if we let go, we stay.

In other transformations I considered, you would see the other environment only while the object stayed in your hands. Let go, and you return to where you were.

## 3. Shirts — grab to replace with a similar object

Grabbing is probably the most basic trigger in VR, the equivalent of a tap on a touchscreen, partly because the script is easy. But it is also useful for swapping similar objects. The player grabs a folded shirt and an unfolded one takes its place in their hands. That wrinkled shirt says the player is allowed to do a great many things in this room, but not to put everything back. It is a lesson: a virtual space can be reset with a button, but the journey through it cannot. The decision to disturb something is a valid option with consequences.

## 4. The life story and the photographs — grab to play

One more thing about grabbing. In VR it is mostly a visual sense — we grab, and we see a change. In reality it is about touch: material, temperature. Usually that is mimicked with a small vibration on collision.

But a grab can reach the ear as well. When we pick up an object carrying a lot of text, it is usually desirable to hear a voice reading it. We may want to hear it more than once, or to have the voice start over each time the object is picked up, in case something was missed. It matters that no other dialogue interrupts, because the reading may carry the plot.

And sometimes a video or a sound playing on contact feels like magic, because the physical world does not behave that way. That is one of the nicer things an alternative reality has to offer.

Several items in the project play when grabbed. Pick up the official life story written by the Ministry of Defence and you hear the voice of radio host Dan Kaner reading it. As long as you hold the document, he continues. Put it down and pick it up again, and he starts from the top. A visitor who wants to reach the end of the document has to slow down and hear the whole thing. Anyone trying to rush will miss most of the experience.

When you reach the photographs from my mandatory service you can look at them, and when you grab one, the man with the guitar starts strumming. You will not hear him sing, although the original video has that, because of the idea of gradual exposure to the character of Oded: something is always missing at every point until the very end, much like the shark in Jaws.

## 5. The visitors' book — a QR code inside VR

While finishing the project I realised it would be shown in exhibitions, which means that while one person is in the room, others are watching it on a screen. I wanted to give them something to do. If they unlock their phones and scan the QR code on the cover of the visitors' book, they get a Google form inviting them to share a memory of Oded. Once they send it and the game reloads, their answer appears as a new page in the book.

That widens what a visit can be, and it lets the people watching become collaborators. It is only one of many ways to use QR codes and second screens to bring other people into an experience.

The pipeline: a questionnaire in Google Forms exported as CSV, converted by Sheet.Best into JSON, which can be read by an API inside Unity. With that, a game's data can be updated without ever opening the editor.

## 6. Yellow balls — speak to shoot

Microphones can do more than disable objects by volume. They can spawn them. To demonstrate the effect of speaking inside the environment dedicated to ego and creation, I let players shoot little yellow balls out of their mouths. I had to decide what the balls looked like, how fast they flew, and write the script that spawns them whenever someone speaks.

A few admissions:

1. Some testers did not understand that their voice was what spawned the particles.
2. Once they understood, they spoke just to shoot particles around, looking for a reaction from the environment.
3. Knowing that, I gave a few objects a reaction to collision with the mouth-particles — stars disappeared, statues were pushed away.
4. When I pitched this interaction, I was advised to put a question in front of the player immediately, to provoke them into speaking.

It was partly misunderstood and perhaps not well designed, but using voice as an input to shoot particles could be interesting in shooting and adventure games for all sorts of purposes.

## Building the room

Building my bedroom as a virtual environment was genuinely interesting. I sat for hours in the actual room measuring things, trying to get the composition right, wanting it as accurate as possible. Then I started photographing: the floor tile, the covers of books and CDs, the colour of the walls, the view out of the window, the colour of the red box. While copying the notes I used Photoshop to map the pinholes in each sheet of paper and aligned the virtual pins to the holes. Iris Fainberg, a brilliant graphic designer, generously helped with all the CD covers. I used Meshy.AI and Tripo to build the characters — Oded from photographs, Ofra from description alone.
