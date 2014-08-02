//Localized renderer strings
var stringBundle = document.getElementById("fangs-string-bundle");

//Set renderer output style
var sHeadingCssClass = "default";
var bSeparateheadings = false;

//Constants for NumberToWords functions
var Affix = new Array("units", "thousand", "million", "billion", "Tera", "Peta", "Exa");
var Name = new Array("zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen");
var Namety = new Array("twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety");

// Create a trim function for strings
function trim(s)
{
	s=s.replace(/^\s*(.*)/, '$1');
	s=s.replace(/(.*?)\s*$/, '$1');
	return s;
};

// Replace repeated spaces, newlines and tabs with a single space
function clean(s) { return s.replace(/\s/g, " "); };


//Target window
var wTarget;

//Get source document
var SourceDocument = window.opener._content.document;

//Target p element in iframe
var FangsTarget;

var TargetDoc;

//Get language string document
var LangDocument;

//To make sure duplicate calls to tofangs are handled
var RenderIsComplete = true;

//Listbox to add headings to
var HeadingsTargetList;

//Listbox to add links to
var LinksTargetList;

//Start document in english.
var sCurrentLang = "en";
var sPreviousLang = sCurrentLang;

//This is the installation laguage of the screen reader.
//An english language installation will read all announcements in english but
//use e.g. the french voice for content with the lang attribute set to "fr".
var sScreenReaderLang = "en";


//Function to get string constants from lang.xul
function getString(identifier, lang)
{
	var sResult = "";

	if(LangDocument.getElementById(identifier + "_" + lang))
	{
		sResult = LangDocument.getElementById(identifier + "_" + lang).textContent;
	}

	//Not found in original language? Return english version.
	if(sResult.length == 0)
	{
		if(LangDocument.getElementById(identifier + "_en"))
		{
			sResult = LangDocument.getElementById(identifier + "_en").textContent;
		} else {

			//Not found in english either
			alert("Fangs could not find an internal string item with id " + identifier + ". I would be very happy if you could report this error to peter.krantz@gmail.com.");
		}
	}

	return sResult;
}


//Character literal values
var arLiterals = new Array();
arLiterals[0] = new Array(/-/g, "dash");
arLiterals[1] = new Array(/\>/g, "greater");
arLiterals[2] = new Array(/\</g, "less");
arLiterals[3] = new Array(/§/g, "section");
arLiterals[4] = new Array(/\:/g, "colon");
arLiterals[5] = new Array(/\%/g, "percent");
arLiterals[6] = new Array(/\|/g, "vertical bar");
arLiterals[7] = new Array(/»/g, "right double angle bracket");
arLiterals[8] = new Array(/\~/g, "tilde");
arLiterals[9] = new Array(/·/g, "dot");
arLiterals[10] = new Array(/\//g, "slash");
arLiterals[11] = new Array(/\&/g, "and");
arLiterals[12] = new Array(/\+/g, "plus");
arLiterals[13] = new Array(/©/g, "copyright");
arLiterals[14] = new Array(/®/g, "registered");
arLiterals[15] = new Array(/™/g, "trade mark");
arLiterals[16] = new Array(/£/g, "pounds");
arLiterals[17] = new Array(/€/g, "euros");
arLiterals[18] = new Array(/\@/g, "at");
arLiterals[19] = new Array(/\[/g, "left bracket");
arLiterals[20] = new Array(/\]/g, "right bracket");
arLiterals[21] = new Array(/\{/g, "left brace");
arLiterals[22] = new Array(/\}/g, "right brace");
arLiterals[23] = new Array(/\$/g, "dollars");
arLiterals[24] = new Array(/\*/g, "star");
arLiterals[25] = new Array(/\#/g, "number");
arLiterals[26] = new Array(/\(/g, "left paren");
arLiterals[27] = new Array(/\)/g, "right paren");
arLiterals[28] = new Array(/•/g, "bullet");
arLiterals[29] = new Array(/\=/g, "equals");
arLiterals[30] = new Array(/«/g, "left double angle bracket");
arLiterals[31] = new Array(/\"/g, "quote");
arLiterals[32] = new Array(/([0-9]+)([,])/g, "$1");
arLiterals[33] = new Array(/_/g, "underline");

arLiterals[34] = new Array(/\u20ac/g, "euros"); //Handle characters in UTF-8 pages
arLiterals[35] = new Array(/\u2022/g, "bullet");
arLiterals[36] = new Array(/\u00a3/g, "pounds");
arLiterals[37] = new Array(/\u0024/g, "dollars");
arLiterals[38] = new Array(/\u00a9/g, "copyright");
arLiterals[39] = new Array(/\u00a9/g, "trade mark");
arLiterals[40] = new Array(/\u00ab/g, "left double angle bracket");
arLiterals[41] = new Array(/\u00bb/g, "right double angle bracket");

//Array of elements that shouldn't be crawled.
var arIsNotCrawlable = new Array('script', 'style', 'meta', 'head', 'caption', 'noscript', 'option');



//List of links data
var arLinkData = new Array();
var iLinkDataCount = 0;


//List of headings data
var arHeadingData = new Array();
var iHeadingDataCount = 0;



//Convert numbers to text
function Small(TC, J, K) {
    if (J == 0) {
        return TC;
    }
    if (J > 999) {
        return " [Error in converting number]";
    }
    var S = TC;
    if (J > 99) {
        S += Name[Math.floor(J / 100)] + " hundred ";
        J %= 100;
        if (J > 0) {
            S += " ";
        }
    } else {
        if ((S > "") && (J > 0) && (K == 0)) {
            S += " ";
        }
    }
    if (J > 19) {
        S += Namety[Math.floor(J / 10) - 2];
        J %= 10;
        S += (J > 0 ? "-" : " ");
    }
    if (J > 0) {
        S += Name[J] + " ";
    }
    if (K > 0) {
        S += Affix[K] + " ";
    }
    return S;
}



function iToWord(L, K) {
    if (L == 0) {
        return (K > 0 ? "" : Name[0]);
    }
    return Small(iToWord(Math.floor(L / 1000), K + 1), L % 1000, K);
}



//Convert an integer to it's text representation (e.g. 123 -> "one hundred and twenty three")
function NumberToWords(iNumber)
{
	return iToWord(iNumber, 0)
}



//Reload default source and render new output
function ReloadSource()
{
	//reset iframe.
	ClearOutput();

	tofangs();
}





//Set default values from prefs
function SetDefaults()
{
	//Reset renderer voice default lang
	var prefs = new PrefsWrapper1("extensions.fangs.");


	if(prefs)
	{

		if(prefs.getUnicharPref("output.defaultlang"))
		{
			sCurrentLang = prefs.getUnicharPref("output.defaultlang");
		} else {
			sCurrentLang = "en";
		}

		sPreviousLang = sCurrentLang;

		//Get output style of headings (default or sectioned)
		if(prefs.getUnicharPref("output.style"))
		{
			sHeadingCssClass = prefs.getUnicharPref("output.style");
			bSeparateheadings = true;
		} else {
			sHeadingCssClass = "default";
			bSeparateheadings = false;
		}
	}
}





//Clear output
function ClearOutput()
{
	//Create new target
	var FangsTargetNew = window.frames[1].document.createElement("p");
	FangsTargetNew.setAttribute("id","fangsoutputp");

	var d1 = window.frames[1].document.getElementById("target");
	var d2 = window.frames[1].document.getElementById("fangsoutputp");

	//replace previous item
	d1.replaceChild(FangsTargetNew, d2);

	//reset list of links and headings
	arLinkData = new Array();
	iLinkDataCount = 0;

	//List of headings data
	arHeadingData = new Array();
	iHeadingDataCount = 0;

	//Clear list of links
	ClearListbox(window.document.getElementById("lbLinks"));

	//Clear list of headings
	ClearListbox(window.document.getElementById("lbHeadings"));
}




//Removes all items from a listbox object
function ClearListbox(oListbox)
{
	if(oListbox)
	{
		while(oListbox.getRowCount() > 0)
		{
			oListbox.removeItemAt(0);
		}
	}
}



//Main function to start rendering of output
function tofangs()
{
	//Set onload attribute to null to handle mozilla bug http://bugzilla.mozilla.org/show_bug.cgi?id=196057
	//var mainWin = document.getElementById('fangsouput');
	//mainWin.setAttribute("onload",null);

	//Set default values
	SetDefaults();

	LangDocument = window.frames[0].document;

	TargetDoc = window.frames[1].document;

	//destination iframe
	FangsTarget = TargetDoc.getElementById('fangsoutputp');

	//handle output
	if(SourceDocument!=null)
	{
		//Write document intro
		StartDocument();

		//Start crawling tree
		crawl(SourceDocument.getElementsByTagName('html')[0], 0);
	}


	//First tab complete - do list of headings tab
	RenderListOfHeadings();

	//Do list of links tab
	RenderListOfLinks();

	return true;
}




//Write document start
function StartDocument()
{
	//get headcount
	var h1 = SourceDocument.getElementsByTagName('h1');
	var h2 = SourceDocument.getElementsByTagName('h2');
	var h3 = SourceDocument.getElementsByTagName('h3');
	var h4 = SourceDocument.getElementsByTagName('h4');
	var h5 = SourceDocument.getElementsByTagName('h5');
	var h6 = SourceDocument.getElementsByTagName('h6');

	var iHeaderCount = h1.length + h2.length + h3.length + h4.length + h5.length + h6.length;

	//Get frame count
	var aframes = SourceDocument.getElementsByTagName('frame');
	var aiframes = SourceDocument.getElementsByTagName('iframe');
	var iFrameCount = aframes.length + aiframes.length;

	//Count only links with href attributes (Thanks to Simon Carney)
	var alinks = SourceDocument.getElementsByTagName('a');
	var iLinkCount = 0;
	for(var i=0; i < alinks.length; i++)
	{
		if(alinks[i].href)
		{
			iLinkCount++;
		}
	}


	//Announce page intro (frames, headings and links).
	var sPageIntro = '';

	if(iHeaderCount + iLinkCount + iFrameCount > 0)
	{
		sPageIntro = getString('anPagePart1', sScreenReaderLang) + ' ';
	}


	//Frames
	if(iFrameCount > 0)
	{
		sPageIntro += NumberToWords(iFrameCount) + ' ' + ((iFrameCount > 1) ? getString('anPageFrame', sScreenReaderLang) : getString('anPageFrameOne', sScreenReaderLang));
	}

	//Headings
	if(iHeaderCount > 0)
	{
		sPageIntro += ((iFrameCount > 0) ? ', ':'') + NumberToWords(iHeaderCount) + ' ' + ((iHeaderCount > 1) ? getString('anPageHeading', sScreenReaderLang):getString('anPageHeadingOne', sScreenReaderLang));
	}

	//Links
	if(iLinkCount > 0)
	{
		sPageIntro += ((iFrameCount + iHeaderCount > 0) ? ' ' + getString('anPagePart2', sScreenReaderLang) + ' ' : '') + NumberToWords(iLinkCount) + ' ' + ((iLinkCount > 1) ? getString('anPageLink', sScreenReaderLang) : getString('anPageLinkOne', sScreenReaderLang));
	}
	else
	{
		//Headings or frames but no links
		if(iFrameCount + iHeaderCount > 0)
		{
			sPageIntro += ' ' + getString('anPageLinkNone', sScreenReaderLang);
		}
	}


	if(sPageIntro.length > 0)
	{
		Announce(sPageIntro);
	}


	//Get page title
	if(SourceDocument.title!=null)
	{
		Write(Translate(SourceDocument.title + ' - Firefox'), false);
		window.document.getElementById('sourceurl').value = SourceDocument.title;

		//Set title for fangs window
		window.document.title = "Fangs: " + SourceDocument.title + " (" + SourceDocument.location + ")";
	}

	return true;

}



//Crawl source document
function crawl(e, r)
{
	//Keep track of language switching in html
	var isLangChange = false;

	//Check if current node is a frame
	if(e.nodeName.toLowerCase()=='frame' || e.nodeName.toLowerCase()=='iframe')
	{
		//Output the frame element
		FangsOutputStart(e);

		//crawl frame document
		if(e.contentDocument!=null)
		{
			crawl(e.contentDocument.getElementsByTagName('html')[0], 0);
		}
	}

	if(!(e.nodeType==1 || e.nodeType==3))
		return;

	//write element info
	if(e.nodeType==3)
	{
		//This is a text node
		if(trim(e.textContent).length > 0)
		{
			//Text node has content - write it
			Write(' ' + Translate(e.textContent));
		}
	} else {
		//This is an element - output it but skip frame details (already rendered)
		if(e.nodeName.toLowerCase()!='frame' && e.nodeName.toLowerCase()!='iframe')
		{

			//Check lang attribute change
			if(e.getAttribute("lang")!=null)
			{
				if(e.getAttribute("lang").length > 0)
				{
					//Write lang change
					var eLang = e.getAttribute("lang");
					if(eLang) {
					    if(eLang.substr(0,2) != sCurrentLang)
					    {
						sPreviousLang = sCurrentLang;
						sCurrentLang = e.getAttribute("lang");
						AnnounceLangSwitch(sPreviousLang, sCurrentLang);
						isLangChange = true;

					    }
					}

					//sFrameInfo += e.getAttribute("lang");
				}
			}

			//Ouput start for element e
			FangsOutputStart(e);
		}
	}

	//Do not dive into the following elements
	if(IsCrawlable(e))
	{
		var ch = e.firstChild;

		while (ch!=null)
		{
			//recurse
			crawl(ch, r + 1);
			ch = ch.nextSibling;
		}
	}

	//Close element
	FangsOutputEnd(e);

	//Reset lang change to previous language
	if(isLangChange)
	{
		AnnounceLangSwitch(sCurrentLang, sPreviousLang);
		sCurrentLang = sPreviousLang;
		isLangChange = false;
	}

	return true;
}






//Check if an element and it's children should be crawled.
function IsCrawlable(e)
{
	//Is element visible?
	if(IsHidden(e))
	{
		return false;
	}

	//Is element blacklisted?
	for (var i = 0; i < arIsNotCrawlable.length; i++)
	{
		if(e.nodeName.toLowerCase()==arIsNotCrawlable[i])
		{
			return false;
		}
	}

	//Tests passed - return true
	return true;
}






//Render opening announcements for certain elements
function FangsOutputStart(e)
{

	switch(e.nodeName.toLowerCase())
	{
		case 'blockquote':  Announce(getString('anBlockQuoteStart', sScreenReaderLang)); break
		case 'a':  OutputLink(e); break
		case 'h1':  OutputHeading(e); break
		case 'h2':  OutputHeading(e); break
		case 'h3':  OutputHeading(e); break
		case 'h4':  OutputHeading(e); break
		case 'h5':  OutputHeading(e); break
		case 'h6':  OutputHeading(e); break
		case 'img': OutputImage(e); break
		case 'ul':  OutputList(e); break
		case 'ol':  OutputList(e); break
		case 'li':  OutputListItem(e); break
		case 'table': OutputTable(e); break
		case 'input': OutputFormInput(e); break
		case 'textarea': OutputTextArea(e); break
		case 'select': OutputSelect(e); break
		case 'dd': OuputDefDescription(e); break
		case 'dl': OutputDefList(e); break
		case 'frame': OutputFrame(e); break
		default: ;
	}
}



//Render closing announcements for certain elements.
function FangsOutputEnd(e)
{
	switch(e.nodeName.toLowerCase())
	{
		case 'blockquote':  Announce(getString('anBlockQuoteEnd', sScreenReaderLang)); break
		case 'table': Announce(getString('anTableEnd', sScreenReaderLang)); break
		case 'ul': Announce(getString('anListEnd', sScreenReaderLang)); break
		case 'ol': Announce(getString('anListEnd', sScreenReaderLang)); break
		case 'dl': Announce(getString('anListEnd', sScreenReaderLang)); break
		case 'input': CloseFormInput(e); break
		case 'a':  CloseLink(e); break
		case 'frame':  CloseFrame(e); break
	}
}




//Render definition list description element (dd)
function OuputDefDescription(e)
{
	Announce(getString('anDefListEquals', sScreenReaderLang));

	return;
}



//Ouput heading element
function OutputHeading(e)
{
	var iLevel = 0;
	var sElement = "span";

	switch(e.nodeName.toLowerCase())
	{
		case 'h1':  AnnounceSpecial(getString('anHeading1', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=1; break
		case 'h2':  AnnounceSpecial(getString('anHeading2', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=2; break
		case 'h3':  AnnounceSpecial(getString('anHeading3', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=3; break
		case 'h4':  AnnounceSpecial(getString('anHeading4', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=4; break
		case 'h5':  AnnounceSpecial(getString('anHeading5', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=5; break
		case 'h6':  AnnounceSpecial(getString('anHeading6', sScreenReaderLang), sElement, sHeadingCssClass); iLevel=6; break
	}

	//Add heading to heading collection
	iHeadingDataCount++;
	arHeadingData[iHeadingDataCount - 1] = new Array(clean(e.textContent), iLevel);

}



//render link
function CloseLink(e)
{
	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}




//render frame closure
function CloseFrame(e)
{
	sFrameInfo = '';

	if(e.getAttribute("title")!=null)
	{
		if(e.getAttribute("title").length > 0)
		{
			//get title attribute
			sFrameInfo += e.getAttribute("title") + ' ';
		}
	}

	sFrameInfo += ((sFrameInfo.length > 0) ? getString('anFrameEnd', sScreenReaderLang) : getString('anFrameEndNoTitle', sScreenReaderLang)) + '.';

	Announce(sFrameInfo);

	return;
}




//render link
function OutputLink(e)
{
	//Check if link target is on same page
	var sUrl = e.getAttribute('href');
	var sTextToAnnounce = getString('anLink', sScreenReaderLang);

	if(sUrl!=null)
	{
		if(sUrl.substring(0,1)=="#")
		{
			sTextToAnnounce = getString('anThisPageLink', sScreenReaderLang);
		}

		Announce(sTextToAnnounce);
	}

	//Check if tab order was specified
	var iTabOrder = e.getAttribute('tabindex');

	if(iTabOrder==null)
	{
		//Set it really high
		iTabOrder = 999999;
	}


	//Add link to link collection (add accesskey information if available)
	iLinkDataCount++;
	var sAccesskeyText = GetAccesskeyText(e);

	if(sAccesskeyText.length > 0)
	{
		arLinkData[iLinkDataCount - 1] = new Array(e.textContent + " " + sAccesskeyText, iTabOrder);
	} else
	{
		arLinkData[iLinkDataCount - 1] = new Array(e.textContent, iTabOrder);
	}

	return;
}







//render form input element
function OutputFormInput(e)
{
	//Check for type attrib
	aType = e.getAttribute('type');
	if(aType!=null)
	{
		switch(aType.toLowerCase())
		{
			case 'text':  OutputTextBox(e); break
			case 'submit': OutputButton(e); break
			case 'button': OutputButton(e); break
			case 'checkbox': OutputCheckbox(e); break
			case 'radio': OutputRadio(e); break
			case 'file': OutputFileUpload(e); break
		}
	} else {
		//Old html for field. Ouput as plain text field.
		OutputTextBox(e);
	}
}





//render select element
function OutputSelect(e)
{
	//write title if it exists - thanks to Jeanne Spellman
	AnnounceTitle(e);

	Announce(getString('anComboBox', sScreenReaderLang));

	//Get currently selected value
	if(e.options.length > 0)
	{
		Write(' ' + Translate(e.options[e.selectedIndex].text));
	}

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}




//render checkbox element
function OutputCheckbox(e)
{
	Announce(getString('anCheckbox', sScreenReaderLang));

	//Check status
	if(e.checked)
	{
		Announce(getString('anChecked', sScreenReaderLang));
	} else {
		Announce(getString('anNotChecked', sScreenReaderLang));
	}

	//write title if it exists - thanks to Jeanne Spellman
	AnnounceTitle(e);

	//Write field contents
	Write(' ' + Translate(e.textContent));

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}






//render radio button element
function OutputRadio(e)
{
	Announce(getString('anRadioBtn', sScreenReaderLang));


	//Check status
	if(e.checked)
	{
		Announce(getString('anChecked', sScreenReaderLang));
	} else {
		Announce(getString('anNotChecked', sScreenReaderLang));
	}

	//write title if it exists
	AnnounceTitle(e);

	//Write field contents
	Write(' ' + Translate(e.textContent));

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}




//Render textarea element (Thanks to Simon Carney)
function OutputTextArea(e)
{
	Announce(getString('anEdit', sScreenReaderLang));

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}




//render form input element
function CloseFormInput(e)
{
	//Check for type attrib
	aType = e.getAttribute('type');
	if(aType!=null)
	{
		switch(aType.toLowerCase())
		{
			case 'submit': Announce(getString('anSubmitBtn', sScreenReaderLang)); break
			case 'button': Announce(getString('anFormBtn', sScreenReaderLang)); break
		}
	}
}



//Check if accesskey attribute has been specified
function RenderAccesskey(e)
{
	var sAccesskeytext = GetAccesskeyText(e);

	if(sAccesskeytext.length > 0)
	{
		//Write accesskey details
		Announce(Translate(sAccesskeytext));
	}

	return;
}



//Get text for accesskey
function GetAccesskeyText(e)
{
	var aAk = e.getAttribute('accesskey');
	if(aAk!=null)
	{
		//return accesskey details
		return "alt+" + aAk.toLowerCase();
	} else {
		return "";
	}
}



//render textbox
function OutputTextBox(e)
{
	Announce(getString('anTextBox', sScreenReaderLang));

	//Write field contents
	aVal = e.getAttribute('value');
	if(aVal!=null)
	{
		Write(' ' + Translate(aVal));
	}

	Write(' ' + Translate(e.textContent));

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}





//render file upload field
function OutputFileUpload(e)
{
	//write title if it exists
	AnnounceTitle(e);

	Announce(getString('anFileUploadField', sScreenReaderLang));

	//Write field contents
	aVal = e.getAttribute('value');
	if(aVal!=null)
	{
		Write(' ' + Translate(aVal));
	}

	Write(' ' + Translate(e.textContent));

	//Check accesskey attribute
	RenderAccesskey(e);

	//render button
	Announce(getString('anBrowseBtn', sScreenReaderLang));

	return;
}




//render form button
function OutputButton(e)
{
	//Announce button label - if title attribute is available it overrides the value attribute.
	aVal = e.getAttribute('title');
	if(aVal!=null)
	{
		AnnounceTitle(e);
	} else {
		aVal = e.getAttribute('value');
		if(aVal!=null)
		{
			Announce(aVal);
		}
	}

	//Check accesskey attribute
	RenderAccesskey(e);

	return;
}




//render frame
function OutputFrame(e)
{
	//Announce frame
	sFrameInfo = getString('anFrame', sScreenReaderLang);

	if(e.getAttribute("title")!=null)
	{
		if(e.getAttribute("title").length > 0)
		{
			//get title attribute
			sFrameInfo += getString('anFrameTitle', sScreenReaderLang) + e.getAttribute("title");
		}
	}

	Announce(sFrameInfo);

	return;
}




//render img element details
function OutputImage(e)
{
	var sLabel = "";

	if(trim(e.alt).length > 0)
	{
		//Get alt text
		sLabel = trim(e.alt);
	} else {

		if(e.getAttribute("title")!=null)
		{
			if(e.getAttribute("title").length > 0)
			{
				//get title attribute
				sLabel = e.getAttribute("title");
			}
		} else {
			//Check if parent element is a link
			if(e.parentNode.nodeName.toLowerCase()=="a")
			{
				//Parent is a link - ouput image name if no alt or title.
				sLabel = e.getAttribute("src");

				//only use last part
				sLabel = sLabel.substring(sLabel.lastIndexOf("/"));
			}
		}
	}


	//Check for alt attribute
	if(sLabel.length > 0)
	{
		Announce(getString('anImage', sScreenReaderLang));
		Write(Translate(sLabel));
	} else {
		//do nothing

	}

	return;
}



//Render ul and ol lists
function OutputList(e)
{
	//count list items
	var iItemCount = ChildElementCount(e);

	//Check number of items
	if(iItemCount == 1)
	{
		//USe string for one item
		Announce(getString('anListOne', sScreenReaderLang));
	} else {
		//Use string for multiple items
		Announce(getString('anList', sScreenReaderLang).replace('%x', NumberToWords(iItemCount)));
	}

}





//Render definition list
function OutputDefList(e)
{
	//count list items
	iItemCount = DefListTermCount(e);

	//Check number of items
	if(iItemCount == 1)
	{
		//USe string for one item
		Announce(getString('anDefListOne', sScreenReaderLang));
	} else {
		//Use string for multiple items
		Announce(getString('anDefList', sScreenReaderLang).replace('%x', NumberToWords(iItemCount)));
	}
}




//render list item
function OutputListItem(e)
{
	//Check list type
	if(e.parentNode.nodeName.toLowerCase()=='ul')
	{
		Announce(getString('anListBullet', sScreenReaderLang));
	}

	if(e.parentNode.nodeName.toLowerCase()=='ol')
	{
		Announce(NumberToWords(GetSiblingOrder(e)) + '');
	}
}


//Get the sibling position (int) of the list element
function GetSiblingOrder(e)
{
	iOrderNo = 1;

	psib = e.previousSibling;

	while (psib!=null)
	{
		if(psib.nodeName.toLowerCase()==e.nodeName.toLowerCase())
		{
			iOrderNo++;
		}

		psib = psib.previousSibling;
	}
	return iOrderNo;
}







//Check if an element is hidden by a css or inline style rule
function IsHidden(e)
{
	if(!(e.nodeType==1))
		return false;

	//Get element style
	var eStyle = window.opener._content.document.defaultView.getComputedStyle(e, null);

	if(eStyle)
	{
		if(eStyle.getPropertyValue('display').toLowerCase() == 'none')
		{
			//Element hidden - do not output it
			return true;
		}
	}

	//Not hidden
	return false;
}






//render table
function OutputTable(e)
{
	//Check for caption
	eCaption = e.getElementsByTagName('caption');
	if(eCaption[0]!=null)
	{
		Announce(getString('anTableCaption', sScreenReaderLang) + ' ');
		Write(Translate(eCaption[0].textContent));
	}

	//Check for summary attrib
	aSummary = e.getAttribute('summary');
	if(aSummary!=null)
	{
		Announce(getString('anTableSummary', sScreenReaderLang) + ' ');
		Write(Translate(e.getAttribute('summary')) + ' ', false)
	}

	//Table size
	eRows = e.getElementsByTagName('tr');
	intColSize = ChildElementCount(eRows[0]);
	intRowSize = eRows.length;

	//Table with x column(s) and y row(s)...
	Announce(getString('anTablePart1', sScreenReaderLang) + ' ' + NumberToWords(intColSize) + ((intColSize > 1) ? getString('anTableCol', sScreenReaderLang) : getString('anTableColOne', sScreenReaderLang)) + ' ' + getString('anTablePart2', sScreenReaderLang) + ' ' + NumberToWords(intRowSize) + ((intRowSize > 1) ? getString('anTableRow', sScreenReaderLang) : getString('anTableRowOne', sScreenReaderLang)) + getString('anTablePart3', sScreenReaderLang));
}





//Get count of child elements
function ChildElementCount(e)
{
	var iCount = 0;

	//Count non-text child nodes
	if(e!=null)
	{
		for(var i=0; i < e.childNodes.length; i++)
		{
			if(e.childNodes[i].nodeType==1)
			{
				iCount++;
			}
		}
	}

	return iCount;
}



//Get count of definition list term count
function DefListTermCount(e)
{
	iCount = 0;

	//Count non-text child nodes
	if(e!=null)
	{
		for(var i=0; i < e.childNodes.length; i++)
		{
			if(e.childNodes[i].nodeType==1 && e.childNodes[i].nodeName.toLowerCase() == 'dt')
			{
				iCount++;
			}
		}
	}

	return iCount;
}




//Transform numbers in text (remove commas from numbers) Thanks to Simon Carney
function TransformNumbers(strValue)
{
	return strValue.replace(/(,)(\d)/g, "$2");
}




//Translate text to fangs ouput.
function Translate(sText)
{
	if(sText!=null)
	{

		//Transform numbers
		sText = TransformNumbers(sText);

		//Loop literals and replace text
		for(var i=0; i < arLiterals.length;i++)
		{
			sText = sText.replace(arLiterals[i][0], ' ' + arLiterals[i][1] + ' ');
		}


		//Convert separate string based on numerals
		var arParts = sText.split(/(\d+)/g);

		var sResult = "";


        for(var iC=0; iC < arParts.length; iC++)
        {

			 //Check if current part is numeric
			 if(!isNaN(parseInt(arParts[iC])))
			 {

				//It is a number - check if previous item ended with a period
				if(iC > 0)
				{

					if(arParts[iC-1].substr(arParts[iC-1].length-1,1)==".")
					{
						//Convert previous period
						sResult = sResult.substr(0, sResult.length-1) + " point";

						//This is a fraction part - spell each number separately
						for(var iF=0;iF < arParts[iC].length; iF++)
						{
							sResult = sResult + " " + Name[parseInt(arParts[iC][iF])];
						}
					} else {
						//No preceding period - add the part to the output
						sResult = sResult + NumberToWords(parseInt(arParts[iC]));
					}


				} else {
					//No preceding period - add the part to the output
					sResult = sResult + NumberToWords(parseInt(arParts[iC]));
				}


			 } else {

				//Just add the part to the output
				sResult = sResult + arParts[iC];
			 }

        }

		//return result
		return sResult;

	} else { return "";}
}




//Write text to fangs target
function Write(sText, blnNewLine)
{
	FangsTarget.appendChild(TargetDoc.createTextNode(sText));

	if(blnNewLine)
	{
		FangsTarget.appendChild(TargetDoc.createElement('br'));
	}
}



// Fangs announcer text
function Announce(sText)
{
	AnnounceSpecial(sText, 'span', 'announce');
}


// Announce language change
function AnnounceLangSwitch(sFromLang, sToLang)
{
	var arLang = new Array(2);
	arLang[0] = sFromLang;
	arLang[1] = sToLang;

	eImg = TargetDoc.createElement('img');
	eImg.setAttribute('src','chrome://fangs/skin/globe.png');
	eImg.setAttribute('class','langicon');
	eImg.setAttribute('alt',stringBundle.getFormattedString("fangs_langswitch", arLang));
	FangsTarget.appendChild(eImg);
	AnnounceSpecial(stringBundle.getFormattedString("fangs_langswitch", arLang), 'span', 'langannounce');
}


//Translates language id (sv -> Swedish)
function GetLanguageFromId(sLangId)
{
	//not implemented yet
	return sLangId;
}


// Announce with a specific css class
function AnnounceSpecial(sText, sAsElement, sClass)
{
	if(sText.length > 0)
	{
		var eSpan = TargetDoc.createElement(sAsElement);
		eSpan.setAttribute('class',sClass);
		eSpan.appendChild(TargetDoc.createTextNode('' + sText + ''));
		FangsTarget.appendChild(eSpan);
	}

	return;
}




//Render element title attribute
function AnnounceTitle(e)
{
	aVal = e.getAttribute('title');
	if(aVal!=null)
	{
		Announce(Translate(aVal));
	}

	return;
}



//Render list of headings
function RenderListOfHeadings()
{
	//Get headings list object
	HeadingsTargetList = window.document.getElementById("lbHeadings");

	if(HeadingsTargetList!=null)
	{
		//Use headings from crawled content
		if(iHeadingDataCount > 0)
		{
			//create heading items in listbox
			for(var iCurrentHeading = 0; iCurrentHeading < iHeadingDataCount; iCurrentHeading++)
			{
				HeadingsTargetList.appendItem(trim(arHeadingData[iCurrentHeading][0]) + ": " + arHeadingData[iCurrentHeading][1]);
			}
		}
	}
}




//Render list of links
function RenderListOfLinks()
{
	//Use links from crawled content
	LinksTargetList = window.document.getElementById("lbLinks");

	//Sort array on link taborder

	if(LinksTargetList!=null)
	{
		if(iLinkDataCount > 0)
		{
			//create new items
			for(var iCurrentLink = 0; iCurrentLink < iLinkDataCount; iCurrentLink++)
			{
				LinksTargetList.appendItem(trim(arLinkData[iCurrentLink][0]));
			}
		}
	}
}


//Open fangs help window
function OpenHelpWin()
{
	//Get browser locale (general.useragent.locale) to pass to url. Used to read the correct help file
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

	var locale = "";

	if (prefs.getPrefType("general.useragent.locale") == prefs.PREF_STRING)
	{
		locale = prefs.getCharPref("general.useragent.locale");
	}

	//Open help url
	window.open('http://www.standards-schmandards.com/fangs/help/index.php?l=' + locale + "&v=" + fangsversion);
	return;
}



function NotYet()
{
	alert('Sorry, this feature has not been implemented yet.');
}
