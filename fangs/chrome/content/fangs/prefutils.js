/* prefutils.js   v1.0
 *
 * Wrapper for Mozilla preferences XPCOM components.
 * Copyright (c) 2005 Nickolay Ponomarev <asqueella@gmail.com>
 *
 * Used as per recommendation at https://developer.mozilla.org/En/Code_snippets/Preferences
 *
 * Documentation is available at http://mozilla.doslash.org/prefutils
 */

// do not define the same version twice
    if(typeof(PrefsWrapper1) != "function") {
        function PrefsWrapper1(aRoot)
        {
            const nsIPrefBranchInternal = Components.interfaces.nsIPrefBranchInternal;
            const nsISupportsString = Components.interfaces.nsISupportsString;
            const nsILocalFile = Components.interfaces.nsILocalFile;
            const nsIRelativeFilePref = Components.interfaces.nsIRelativeFilePref;

            this.prefSvc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            this.prefSvc.QueryInterface(Components.interfaces.nsIPrefBranch);
            this.branch = this.prefSvc.getBranch(aRoot);

            this.prefSvc.QueryInterface(nsIPrefBranchInternal);
            this.branch.QueryInterface(nsIPrefBranchInternal);

            this.__proto__ = this.branch; // "inherit" from nsIPrefBranch.

            this.getSubBranch = function(aSubpath) {
                return new PrefsWrapper1(this.branch.root + aSubpath);
            }

            // unicode strings
            this.getUnicharPref = function(aPrefName) {
                return this.branch.getComplexValue(aPrefName, nsISupportsString).data;
            };
            this.setUnicharPref = function(aPrefName, aValue) {
                var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(nsISupportsString);
                str.data = aValue;
                this.branch.setComplexValue(aPrefName, nsISupportsString, str);
            };

            // for strings with default value stored in locale's .properties file
            this.getLocalizedUnicharPref = function(aPrefName) {
                return this.branch.getComplexValue(aPrefName, Components.interfaces.nsIPrefLocalizedString).data;
            };

            // store nsILocalFile in prefs
            this.setFilePref = function(aPrefName, aValue) {
                this.branch.setComplexValue(aPrefName, nsILocalFile, aValue);
            };
            this.getFilePref = function(aPrefName) {
                return this.branch.getComplexValue(aPrefName, nsILocalFile);
            };

            // aRelTo - relative to what directory (f.e. "ProfD")
            this.setRelFilePref = function(aPrefName, aValue, aRelTo) {
                var relFile = Components.classes["@mozilla.org/pref-relativefile;1"].createInstance(nsIRelativeFilePref);
                relFile.relativeToKey = aRelTo;
                relFile.file = aValue;
                this.branch.setComplexValue(aPrefName, nsIRelativeFilePref, relFile);
            };
            this.getRelFilePref = function(aPrefName) {
                return this.branch.getComplexValue("filename", nsIRelativeFilePref).file;
            };

            // don't throw an exception if the pref doesn't have a user value
            this.clearUserPrefSafe = function(aPrefName) {
                try {
                    this.branch.clearUserPref(aPrefName);
                } catch(e) {}
            };

        }
    }

