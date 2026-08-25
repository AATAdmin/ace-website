# Design notes: `services.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, tutoring
  ============================================================
  THE TEACHING PROCESS (.flow) is a clickable flow chart: six nodes
  in order, each selecting a panel that explains that step and shows
  a screenshot of it. It is a proper tablist, so arrow keys work, and
  a <noscript> rule shows every panel at once when JS is off, which
  means the process still reads as a plain list.

  FOUR IMAGE SLOTS (.fpimg), on steps 01, 02, 04 and 05. To fill one,
  put an <img> inside it and delete the placeholder text. Steps 03 and
  06 carry .fpimg.fpnone instead, which says no screenshot is needed;
  if you get a picture for one, swap the class. Any portal screenshot
  must be the FAMILY view with dummy data, never an admin screen: the
  old ones showed balances, margin and the names of real students.


  ONE FLOW, NOT TWO. There used to be a "The lesson" card trio and
  a separate "The system" step list, and they both described the
  platform and the whiteboard. They are now one process. Do not
  split them again: if something new needs saying, it is another
  step or it is not on this page.

  This page is about HOW we teach, not what. The subject list is a
  routing strip at the end, not the substance: the argument is the
  system, live teaching on our own platform, a saved whiteboard, a
  written note, and the next lesson starting from that note.

  DELETED ON PURPOSE, do not restore:
    - the six subject cards as the main content. Subjects have
      their own pages; repeating them here said nothing new.
    - the stage cards (11+/GCSE/A-Level). The home chooser asks
      stage already.
    - lesson-type cards with prices. pricing.html owns price, and
      duplicating figures meant hydrating them twice. There is no
      £ on this page by design.

  POSITIONING: small group classes are the DEFAULT and one-to-one
  is bespoke. Keep that order in any new copy.

  REMOVED DELIBERATELY: a "Between the lessons" section that
  advertised three unbuilt study tools behind a "Being built now"
  badge. Do not reinstate it, or any claim about interactive
  revision material, self-marking practice or an accumulated
  progress record, until those tools are live. What IS live and
  safe to say: a written report after every lesson, the recording,
  and the saved whiteboard.

  EVERY CLAIM HERE MUST STAY TRUE. Live teaching, own platform,
  shared whiteboard saved, recording kept, written note after each
  session, small group teaching, taught to the exam board spec. Do
  not add capability the portal does not have, particularly
  anything that sounds like analytics or AI.

  Do not reinstate: the free written assessment, the 15-minute
  consultation, "matched within 48 hours", or the gold accent.
  ============================================================
```
