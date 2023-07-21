/**
 * Created by bi on 5/15/16.
 */

var XML = function (xml) {
	this.xml = xml;
	this.error = parseInt(this.getValue('Error'));
	this.errordesc = this.getValue('ErrorDesc');
};

XML.prototype.getValue = function(node) {
	return getValue(this.xml, '<' + node + '>', '</' + node + '>');
};

var getValue = function (xml, open, close) {
	var f = xml.indexOf(open) + open.length;
	var l = xml.indexOf(close);
	if (f > l) return null;
	return xml.substr(f, l - f);
};

module.exports = XML;