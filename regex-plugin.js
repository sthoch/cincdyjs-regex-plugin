/**
 * JavaScript RegExp for CindyJS
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 *
 * All functions:
 *  - first argument: string for the RegExp
 *  - second argument: string to operate on
 *  - modifier "flags" to specify flags https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags
 *  
 * regexreplace/regexreplaceall: 
 *  - third argument: the replacement string
 *
 * regexsplit: 
 *  - modifier "limit" to specifying a limit on the number of splits
 *
 * Example:
 * regexmatchall("t(e)(st(\d?))", "Test1test2", flags->"i");
 * will return a list of matches;
 * each match is a pair of a list with the match as given by JavaScript and the position where the match was found in the string:
 * [[[Test1, e, st1, 1], 0], [[test2, e, st2, 2], 5]]
 */

if (CindyJS && CindyJS.registerPlugin) {
	CindyJS.registerPlugin(1, "regex", function(api) {

		function regExpFromArgs(args, modifs) {
			return new RegExp(
				api.evaluate(args[0])['value'], 
				(modifs.hasOwnProperty('flags')) ? api.evaluate(modifs.flags)['value'] : ""
			);
		}

		function strFromArgs(args, modifs) {
			return api.evaluate(args[1])['value'] + "";
		}

		function toCtype(js) {
			if (js instanceof Array) {
				return {ctype: "list", value: js.map(toCtype)};
			}
			if (typeof js == 'string') {
				return {ctype: "string", value: js};
			}
			if (typeof js == 'number') {
				return {ctype: 'number', value: {real: js, imag: 0}};
			}
			return api.nada;
		}

		api.defineFunction("regextest", 2, function(args, modifs){
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			
			return {ctype: "boolean", value: re.test(str)};
		});

		api.defineFunction("regexmatch", 2, function(args, modifs){
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			
			var result = str.match(re);
			if (result === null)
				return api.nada;

			if (re.global) {
				return toCtype(result);
			} else {
				return toCtype([result, result.index]);
			}

		});

		api.defineFunction("regexmatchall", 2, function(args, modifs){
			if (modifs.hasOwnProperty('flags')) {
				if (modifs.flags.value.indexOf('g') === -1) {
					modifs.flags.value+= 'g';
				}
			} else {
				modifs.flags = toCtype('g');
			}
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			var result = str.matchAll(re);
			return toCtype([...result].map(match => [match, match.index]));

		});
		api.defineFunction("regexreplace", 3, function(args, modifs){
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			
			return toCtype(str.replace(re, api.evaluate(args[2])['value']));
		});

		api.defineFunction("regexreplaceall", 3, function(args, modifs){
			if (modifs.hasOwnProperty('flags')) {
				if (modifs.flags.value.indexOf('g') === -1) {
					modifs.flags.value+= 'g';
				}
			} else {
				modifs.flags = toCtype('g');
			}
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			
			return toCtype(str.replaceAll(re, api.evaluate(args[2])['value']));
		});
		api.defineFunction("regexsearch", 2, function(args, modifs){
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			
			return toCtype(str.search(re, api.evaluate(args[2])['value']));
		});
		api.defineFunction("regexsplit", 2, function(args, modifs){
			var re = regExpFromArgs(args, modifs);
			var str = strFromArgs(args, modifs);
			if (modifs.hasOwnProperty('limit')) {
				var result = str.split(re, api.evaluate(modifs.limit)['value']);
			} else {
				var result = str.split(re);
			}
			return toCtype(result);
		});
	});

}
