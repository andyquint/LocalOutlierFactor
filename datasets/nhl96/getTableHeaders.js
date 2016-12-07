/* Prints to console table headers from http://www.quanthockey.com/nhl/seasons/1995-96-nhl-players-stats.html */
var headers='';
$('#statistics tr').first().find('th').each(function(index) {
	headers=headers+$(this).text()+', ';
});
console.log(headers);
