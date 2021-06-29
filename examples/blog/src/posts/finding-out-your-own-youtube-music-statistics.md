---
title: Finding out your own YouTube Music statistics
date: 2020-12-02
---

In the recent week a lot of my friends've been talking about their Spotify statistics,
namely their favourite song-album-artist of the year, and I've become interested too,
but it seems that YouTube Music - the music service which I'm guilty of using - doesn't offer such thing yet.

![Someone's 🤔 YouTube Music statistics](/images/youtube-stats.png)

However, with the advent of the GDPR regulations - more specifically its [20th article](https://gdpr-info.eu/art-20-gdpr/) -
it's mandatory to offer a machine-readable download containing all of your requested data. Google has to comply with this regulation,
and currently it indeed does: your data is available for download at their [Takeout page](https://takeout.google.com/).
Note that knowing Google this page might be dead in a few years, so if the link doesn't work, then do your search,
it shouldn't be hard to find. Also note that you should request your data in JSON instead of HTML since JSON is easier to process
and I also recommend requesting just what's necessary since I doubt you'll need you Maps data for calculating YouTube Music statistics.
Although it definitely sounds fun to know if you're more likely to play a particular song when you are at a particular place,
it's for another day.

After we've got our data, we can analyse it however we want!
So I wrote a script for it, but you can write your own, do whatever fits your mindless death-chasing which you call life. Anyway, this is how I did it:
I used the file called `watch-history.json`, you should find something similar if you haven't disabled collecting this type of data explicitly beforehand.
This file contains - guess what - your watch history in the form of an array containing objects of which most have `title`, `titleUrl` and `subtitles`
properties, and I'm only interested in these objects since the others seem to be homepage visits.
The video IDs can be extracted from `titleUrl`s; then you just have to get the frequencies of the different video IDs, sort them by frequency and that's it;
you can list the songs you listened to the most!

TODO: add the actual script