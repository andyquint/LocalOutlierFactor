/* Prints to console contents of current table page excluding table header */
var contents='';
$('#statistics tr').slice(1).each(function(index){
	var line = '';
	var $row = $(this);
	$row.find('td').each(function(){
		line=line+$(this).text()+',';
	});
	contents=contents+line+'\n';
});
console.log(contents);
