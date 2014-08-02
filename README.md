Fangs
=====

A [Firefox screen reader emulator extension](https://addons.mozilla.org/sv-se/firefox/addon/fangs-screen-reader-emulator/). Fangs renders a text version of a web page similar to how a screen reader would read it. The ambition is to help developers understand how an assistive device would present a website and thereby increase chances of finding accessibility issues early. Fangs is used by web developers, teachers and quality assurance staff to make websites usable by as many as possible.

Please note that Fangs is not an assistive tool itself.

Fangs was developed in 2004 and the code is still pretty much the same. During this time screen reader software has become a lot better. This means that you should test with a real tool such as Jaws, NVDA or VoiceOver to get a better picture of how your web application behaves.


Building the extension
----------------------

The build folder has shell scripts to create the XPI installer file. Please not that you may have to modify the maxVersion property in install.rdf to be able to test it in a more modern version of FF than version 4.


Contributing
------------

Adding new languages involves translating the fangs/chrome/content/fangs/lang.xul file (see lang.fr.xul for an example translation) as well as text to number functions in script.
