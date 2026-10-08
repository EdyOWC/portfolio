Technical AR implementation: Reli Magnezi.

At the beginning of 2022 I took my third course in interactive experience design. Until then I knew mostly simple tools — EKO, Yoni Bloch's platform, may it rest in peace — and the design tools behind my non-interactive work. In a parallel course the same semester I started wrestling with the Unity game engine and C#. That became far easier about a year later, when AI tools became widely accessible.

What genuinely amazed me at the time was something else: Snapchat, and specifically its augmented reality. In Unity we mostly learned technically demanding and often discouraging processes, and my weekends went on writing and debugging code. In the other course I could dive straight into writing stories.

To get us excited about the technology, the instructors brought in someone from Snapchat to explain the capabilities and show how lenses are made. At its core the idea is simple: define a trigger object that, when the camera recognises it, makes another object appear. He demonstrated with a drawing on a table, onto which a smiling emoji was overlaid on the phone screen. Someone watching from the side could only see the drawing, not the emoji. That moment struck me immediately. An entire world of hidden messages had just opened up.

## Trigger, key, content

The system has three parts. The trigger can be any object in physical space — graffiti, a bus timetable, a banknote. The key is the code that links the innocent-looking object to the content, and it does not necessarily say which object should be scanned. The content is the content, potentially something secret: instructions for a drink, the location of a treasure, a computer password. Minimal traces. Only the combination of trigger and key leads to what is hidden.

We were sent home to make our first lens. Once I had finished mine I decided to test something. What happens if I show the camera only half the trigger? Will it still display the extra layer? To my surprise, a sixteenth of the trigger object was enough to activate the overlay.

In other words, you can distribute the trigger among sixteen different people who all share access to the same content layer. But to stay discreet you need a way to stop someone who steals only part of the trigger from uncovering the whole thing. One answer: scanning part of the trigger reveals different information from scanning the complete object.

## Jaguar 411

With that, and the ambition to build a mystery story on these properties, I started the final project for the course. The idea was generic but effective.

@youtube UkHwrUBEs8E | The opening video. A hacker has twenty minutes of your attention.

A hacker calling himself Jaguar 411 has broken into the player's accounts. The player has to talk to him on WhatsApp over the next twenty minutes to stop the information leaking. During the conversation the player receives clues about what to scan, along with the lenses themselves.

In practice this was the inverse of an escape room — an entry space. We had to work out how to guide a user toward one specific location: our computer lab. The starting point was the entrance to the Mexico building. After the opening video we sent the first lens. When the player scanned the central wall, a GIF of a hand appeared, telling them to come closer. As they approached, the trigger narrowed to the blue figure alone, and the overlay changed with it.

Another discovery shaped the gameplay. Snapchat's software does not recognise three-dimensional objects as triggers, but when the trigger is a staircase with a distinct enough appearance, the player can stand beside it and the lens still recognises it. That let us push the player up to the second floor.

At the lab door the player met a keypad and received another lens. Anyone with experience of escape rooms would understand at once that four objects have to be found to form the code. The colours and shapes hint at the sequence of inputs — a green circle, then a blue rectangle, and so on. But how do you find the numbers themselves? By searching the surroundings for objects to scan by colour, and by following Jaguar's hints.

Anyone who got into the lab had completed the mission.

## Afterwards

Like many projects that stay inside a course or a piece of research, what I found here did not go anywhere. I did not keep working on hidden messages or keep testing what AR tools can do. I still think it is a technology with real potential, precisely because of how little physical footprint it leaves in real space. A great deal has already been written about the possible uses of augmented reality, and I only want to add this one point to it.
