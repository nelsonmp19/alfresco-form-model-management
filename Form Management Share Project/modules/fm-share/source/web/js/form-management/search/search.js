function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function docDetailTemplate(doc)
{
	var dTemp ="";
	var linkPath = "/share/page/repository?path=" + doc.path;
	var siteLink = "";

	if(doc.site){
		linkPath = "/share/page/site/"  + doc.site.shortName + "/documentlibrary?path=" + doc.path;
		siteLink = 'Site: <a href="/share/page/site/'+doc.site.shortName+'/dashboard">'+doc.site.title+'</a>,';
	}

	dTemp = '<div class="doc-search-details">';
	dTemp += '	<h3>';
	dTemp += '		<a class="theme-color-1 ua-res-doc-title" href="document-details?nodeRef='+doc.nodeRef+'">'+doc.name+' </a>';
	dTemp += '		<span class="title">('+doc.title+')</span>';
	dTemp += '	</h3>';
	dTemp += '	<div class="ua-res-detail"> ';
	dTemp += '	<span class="item"><em>Modified on:</em>'+doc.modifiedOn+' by <a href="/share/page/user/'+doc.modifiedByUser+'/profile">'+doc.modifiedBy+'</a></span>';
	dTemp += '	<div class="detail-view">';

	if ( doc.type != "folder" )
	{
		dTemp += 	'<span>'+siteLink+' size: '+bytesToSize( doc.size ) +'</span>';
	}
	dTemp += 	'<span>In Folder: <a href="'+linkPath+'">'+doc.path+'</a></span> </div> </div> </div>';

	return dTemp;
}

function rowTemplate(doc)
{
	var rTemp = "";
		doc.loccontext = "repo";
	if(doc.site) doc.loccontext = "site";

	rTemp += '<div class="'+doc.loccontext+' ua-res-doc">';
	rTemp += '<table style="width:100%" class="detail-list">';
	rTemp += '	<tr>';
	rTemp += '		<td style="  padding-left: 10px;  vertical-align: top; width: 45px;">';
	rTemp += '			<input type="checkbox" class="fileSelect" id="'+doc.id+'" />';
	rTemp += '			<span class="ico-'+doc.loccontext+'">&nbsp;</span> ';
	rTemp += '		</td>';
	rTemp += '		<td class="doc-search-details">';
	rTemp += '			<div class="doc-search-icon">';
	rTemp += '				<a href="#" class="simple-view" style="display:none;"><img title="'+doc.name+'" alt=".pdf" src="/share/res/components/images/filetypes/pdf-file-32.png" id="yui-gen111"></a>';

	if( doc.type == "folder")
	{
		rTemp += '			<a href="#" class="detail-view" id="yui-gen126"><img title="test" alt="test" src="/share/res/components/search/images/folder.png" id="yui-gen125"></a>';
	}
	else
	{
		rTemp += '			<a target="_blank" class="detail-view" href="/share/proxy/alfresco/api/node/content/workspace/SpacesStore//'+doc.id+'/'+doc.name+'?a=true"><img src="/share/proxy/alfresco/api/node/workspace/SpacesStore/'+doc.id+'/content/thumbnails/doclib?ph=true&c=queue" /></a>';
	}

	rTemp += '			</div>';

	rTemp +=  docDetailTemplate(doc);

	rTemp += '			<p class="clear"></p>';
	rTemp += '		</td>';
	rTemp += '		<td style="width: 170px;">';
	rTemp += '			<div class="resultTools">';
	rTemp += '				<ul>';
	rTemp += '					<li><a href="document-details?nodeRef='+doc.nodeRef+'" class="ico-view">View Metadata</a></li>';


	if(doc.type == "document"){
		if (doc.hasWriteAccess) rTemp += '<li><a href="'+doc.id+'" class="ico-move-dropbox">Move to Dropbox</a></li>';
	}

	rTemp += '					<li><a target="_blank" href="/share/proxy/alfresco/api/node/content/workspace/SpacesStore//'+doc.id+'/'+doc.name+'?a=true" class="ico-download">Download</a></li>';
	rTemp += '				</ul>';
	rTemp += '			</div>';
	rTemp += '		</td>';
	rTemp += '	</tr>';
	rTemp += '</table>';
	rTemp += '</div>';
	return rTemp;
}


function injectAlfrescoDefaults()
{
	var injectionForm = $('.injectionForm').html();
	$('.injectionForm').html("");

	$('.f_b_root:eq(0)').prepend( injectionForm );
	$(".modDatePicker").mask("9999-99-99").datepicker({
		"dateFormat": "yy-mm-dd",
		changeMonth: true,
		changeYear: true
	});

	var nodeObj = getQueryObject();

	$('.fm-profile').form("loadPropertiesToFields", nodeObj);
}

function getQueryPath()
{
	var path = "r=false";
	var qtype = $(".fm-search-type").val();

	if(qtype == "all-sites") path = "a=true";
	if(qtype == "repo") path = "r=true";

	return path;
}
function getQueryObject()
{
	var nodeObj = {};
		nodeObj.node = {};
		nodeObj.node.properties = {};

	if(getURLParameter("q") != "")
	{
		var queryString = decodeURIComponent( getURLParameter("q").replace(/prop_/g, "").replace(/_/g, ":") );
		var queryMap = eval("(" + queryString + ")");

		var nodeObj = {};
			nodeObj.node = {};
			nodeObj.node.properties = queryMap;

	}
	return nodeObj;
}

function collectQuery(){
	var qString = "";
	var queryObj = {};
	var keywords = "";

	$('#formFormat .group .frm-fld').each(function(){
		var node = $(this);
		var hasVal = false;
		var dataType = "";

		var nodeProperty = "prop_" + node.attr('name');

		if(node.data("type")) dataType = node.data("type");

		if(node.attr("name") == "cm_modified_from" || node.attr("name") == "cm_modified_to"){
			if($("input[name='cm_modified_to']").val() != "" || $("input[name='cm_modified_from']").val() != ""){
				hasVal = true;
			}
		}else if( node.val() != "" ){
			hasVal = true;
		}

		//Make sure its not working data
		if(node.attr("id")){
			if(node.attr("id").indexOf("bool-") >= 0){
				node = node.parents('.group').find('.isBoolHidden');
			}
		}
		if(node.attr("type") == "radio"){
			//Check if its checked
			if(node.is(':checked')){
				var nodeName = node.attr("name");
				var rVal = node.val();

				queryObj[nodeProperty] = encodeURIComponent( $("input[name='"+nodeName+"']:checked").val()  );

			}

		}else if( dataType.indexOf("boolean") > 0){
			//Add boolean true only so we can still get docs undefined
			if(node.is(":checked")) queryObj[nodeProperty] = true

		}else if(node.attr('name').indexOf('_toDate') > 0){
			//ignore replication
		}else if(node.attr('name') == "t"){
			//ignore keywords
			if(node.val() != "") keywords = "t=" + node.val() + "&";

		}else if(node.hasClass("date")){

			if( node.val() != ""){
				var toVal = $("input[name='" + node.attr('name') + "_toDate']").val();
				var frDate= new Date( node.val() );

				if(toVal){
					var toDate = new Date( toVal );
					queryObj[nodeProperty + "-date-range"] =  ISODateString(frDate)+ "|" + ISODateString(toDate);

				} else{
					queryObj[nodeProperty] = ISODateString(frDate);
				}
			}

		} else if( hasVal && node.val() != "false"){

			if(node.attr("name") == "ua_documenttype"){
				if($('.docInSearch').attr("checked")){
					queryObj[nodeProperty] = encodeURIComponent( node.val());
				}
			}else{
				queryObj[nodeProperty] =  encodeURIComponent( node.val());
			}
		}
	});

	queryObj["datatype"] = "cm:content";
	var jsonString = JSON.stringify(queryObj);
	var urlEncodedQ = keywords + "q=" + (jsonString);

	return urlEncodedQ;
}
function moveDocument(nodes, aspectsToValidate, isRecord, moveNodeRef){
	if(!moveNodeRef) moveNodeRef = "";
	$('.infoMessage span').html("Please wait...");
	$('.infoMessage').removeClass("good").center();
	$('.infoMessage').fadeIn(300).center();

	jQuery.ajax({
		type: "GET",
		url: "/share/proxy/alfresco/imaging/form-management/formdata/move",
		dataType:"json",
		data:{
			nodes: nodes,
			destination: moveNodeRef,
			aspect: aspectsToValidate,
			siteid: $('.fm-site-id').val(),
			isRecord: isRecord
		},
		success:function(r){
			if(r.status == 0){
				$('.infoMessage').addClass("warning");
				$('.infoMessage span').html(r.msg + " " + r.validation.service.msg);
				$('.infoMessage').center();
				setTimeout( '$(".infoMessage").fadeOut(300, function(){  $(".infoMessage").removeClass("warning"); }); ', 4000 );

			}else{
				/* if(parseInt(r.validation.filesFailed) > 0){
					$('.infoMessage').addClass("warning");
					$('.infoMessage span').html("1 item(s) failed. That file did not seem to have all the required metadata to become a Record.");
					$('.infoMessage').center();
					setTimeout( '$(".infoMessage").fadeOut(300, function(){  $(".infoMessage").removeClass("warning"); }); ', 4000 );

				}else{ */
					$('.infoMessage span').html(""+r.successMove + " item(s) moved successfully. " + r.failedMove + " item(s) failed.");
					$('.infoMessage').removeClass("good").center();
					setTimeout( '$(".infoMessage").fadeOut(300, function(){ location.reload(true) }); ', 3000 );
			}
		},
		error:function (xhr, ajaxOptions, thrownError){

			$('.infoMessage').addClass("warning");
			$('.infoMessage span').html("Sorry, you do not have the right permission to do that. Please contact your administrator if you require access.");
			$('.infoMessage').center();
			setTimeout( '$(".infoMessage").fadeOut(300, function(){  $(".infoMessage").removeClass("warning"); }); ', 4000 );
		}
	});

}

function toggleSearchView(showSimple)
{
	if(showSimple)
	{
		$('.detail-view').hide();
		$('.simple-view').show();
		$('.btn-simple-view').addClass("btn-jq-active");
		$('.btn-detail-view').removeClass("btn-jq-active");
		$('.doc-search-icon').css({ 'padding-right': '5px', 'width':'auto' });
	}
	else
	{
		$('.detail-view').show();
		$('.simple-view').hide();
		$('.btn-simple-view').removeClass("btn-jq-active");
		$('.btn-detail-view').addClass("btn-jq-active");
		$('.doc-search-icon').css({ 'padding-right': '20px', 'width':'80px' });
	}
}

function setupFilterField()
{

	var list = ".doc-search-details";


	$('.filter-field')
	.change( function () {
        var filter = $(this).val();
        if(filter != "" && filter.replace(/ /g, "").length > 0 ){
          // this finds all links in a list that contain the input,
          // and hide the ones not containing the input while showing the ones that do
          $(list).find("h3:not(:Contains(" + filter + "))").parents(".ua-res-doc").slideUp();
          $(list).find("h3:Contains(" + filter + ")").parents(".ua-res-doc").slideDown();
        } else {
          $('.ua-res-doc').slideDown();
        }
        return false;
      })
    .keyup( function () {
        // fire the above change event after every letter
        $(this).change();
    });
}
function getURLParameter(name) {
    var query = decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );

    if(query == "null") query = "";

    return query;
}


function search(query){

	$('.sym-search-body .info').hide();
	$('.infoMessage span').html("Searching, please wait...");
	$('.infoMessage').removeClass("good").center();
	$('.infoMessage').fadeIn(300).center();

	var qData = {};
		qData.site= $(".fm-site-id").val().slice(0, -5);
		qData.term=decodeURIComponent( getURLParameter("t") );
		qData.tag=getURLParameter("tag");
		qData.maxResults=251;
		qData.sort=getURLParameter("s");
		qData.query=getURLParameter("q");
		qData.repo=getURLParameter("r");

	$.ajax({
		type: "GET",
		url: "/share/proxy/alfresco/slingshot/search",
		dataType:"json",
		data:qData,
		success:function(r){

			$('.outputRow span').html( r.items.length);

			for(i in r.items)
			{
				var doc = r.items[i];
					doc.id = doc.nodeRef.replace("workspace://SpacesStore/", "");

				var rowHTML = rowTemplate( doc )

				$('.sym-search-body').append( rowHTML );
			}

			$(".infoMessage").fadeOut(300, function(){});
		},
		error:function (xhr, ajaxOptions, thrownError){

			$('.infoMessage').addClass("warning");
			$('.infoMessage span').html("There was an issue with the search service. Contact your administrator.");
			$('.infoMessage').center();
			setTimeout( '$(".infoMessage").fadeOut(300, function(){  $(".infoMessage").removeClass("warning"); }); ', 4000 );
		}
	});

}
$(function(){

	if(getURLParameter("t") != "" || getURLParameter("q") != "") search();

	$('a.simple-view').live("mouseover", function(){
		$(this).parent().find('.detail-view').addClass('preview-jump-out');
	})
	.live("mouseout", function(){
		$(this).parent().find('.detail-view').removeClass('preview-jump-out');
	});

	$('.btn-simple-view').click(function(){
		 toggleSearchView(true);
	});
	$('.btn-detail-view').click(function(){
		 toggleSearchView(false);
	});
	$('.search-type .ibg a').click(function(){
		$('.search-type ul').toggle();
	});

	$('.search-type ul').mouseleave(function(){
		setTimeout("$('.search-type ul').hide();", 500);
	});

	$('.search-type > ul > li > a').click(function(){
		var tC = $(this).attr("class");
	 	var r = "false";
	 	var a = "false";
	 	var query = "";

	 	if(tC == "ico-repo") r = "true";
	 	if(tC == "ico-all-sites") a = "true";

		var params = ["t", "s", "q", "tag", "a", "r"];

		for(i in params){
			var t = getURLParameter(params[i]);
			if(params[i] == "r") t = r;
			if(params[i] == "a") t = a;

			if(t != "") query += params[i] + "="+t +"&";
		}

	    window.location = "?" + query;
	});

	$('.fileSelect').live("click", function(){
		var totalSelected = $('.fileSelect:checked').length;
		if(totalSelected > 0){
			$('.recdocflip .ua-menu').removeClass("ua-disabled");
		} else{
			$('.recdocflip .ua-menu').addClass("ua-disabled");
		}
	});

	$('.ac-mvrecords').click(function(){
		var idList = "";
		$('.fileSelect:checked').each(function(){
			if( !$(this).parents(".ua-res-doc").hasClass("record")) idList += $(this).attr("id") + "~";
		});
		idList = idList.slice(0, -1);
		if(idList != "") moveDocument(idList, nodeValFormAspect, true);

		return false;
	});

	$('.ac-mvdropbox').click(function(){
		var idList = "";
		$('.fileSelect:checked').each(function(){
			if( !$(this).parents(".ua-res-doc").hasClass("record")) idList += $(this).attr("id") + "~";
		});
		idList = idList.slice(0, -1);
		if(idList != "") moveDocument(idList, "", false, $('.fm-dropbox-nodeRef').val().replace("workspace://SpacesStore/", "") );

		return false;
	});

    $('.ico-move').live("click", function(){
		var conf = confirm("Are you sure you want to move this item to Records?");
		if(conf){
			moveDocument($(this).attr("href"), nodeValFormAspect, true);
		}
		return false;
	});
	$('.ico-move-dropbox').live("click", function(){
		var conf = confirm("Are you sure you want to move this item to your Dropbox?");
		if(conf){
			moveDocument($(this).attr("href"), "", false, $('.fm-dropbox-nodeRef').val().replace("workspace://SpacesStore/", "") );
		}
		return false;
	});

	$('.switch').click(function(){
		$('.switch-selected').removeClass('switch-selected');
		if($(this).hasClass('show-records')){
			$('.document').hide();
			$('.record').show();
			$(this).addClass('switch-selected');
		}
		if($(this).hasClass('show-document')){
			$('.record').hide();
			$('.document').show();
			$(this).addClass('switch-selected');
		}
		if($(this).hasClass('show-all')){
			$('.document, .record').show();
			$(this).addClass('switch-selected');
		}
	});
	$( "#configTabs" ).tabs({
		selected: 0
	});


	$('.default').each(function(){
		$(this).val( $(this).attr("title") );
	});

	$('.sym-header input, .search-filter input').focus(function(){
		$(this).removeClass("default");
		$(this).val("");
	})
	.blur (function(){
		if( $(this).val() == "") {
			$(this).addClass("default");
			$(this).val( $(this).attr("title")  );
		}
	});

	$('.lsb').mouseup(function(){
		var sterm = $('#searchindex').val();
		var path = getQueryPath();
		window.location = "?" + path + "&" + sterm.replace(/#VALUE#/g, encodeURIComponent( $('.search-field').val()) );
	});
	$('.search-field').live('keydown', function (e) {
		if(e.which == 13){
			var sterm = $('#searchindex').val();
			var path = getQueryPath();
			window.location = "?" + path + "&" + sterm.replace(/#VALUE#/g, encodeURIComponent( $('.search-field').val()) );
		}
	});

	$('.dynamic-criteria').dialog({
		autoOpen: false,
		width:585,
		resizable: false,
		modal:true,
		draggable:false,
		position: ['center', 15],
		buttons: {
			Cancel: function() {
				$( this ).dialog( "close" );
			},
			"Search": function() {
				var q = collectQuery();
				var path = getQueryPath();
				window.location = "?" + path + "&" + q;
			}
		},
		open: function() {
			$(this).find('.ui-dialog-titlebar-close').blur();
			$(this).addClass('ui-dialog-tabs');

		}
    }).parent().find('.ui-dialog-titlebar-close').prependTo('#configTabs').closest('.ui-dialog').children('.ui-dialog-titlebar').remove()

	$('.dynamic-criteria').parent().draggable({ handle: '.ui-tabs-nav' });

	/* Events */
	$('.advanced-search-button').click(function(){
		$('.dynamic-criteria').dialog("open");
		$('.pageCountCheck ').select().focus();
	});

	$('.ua-menu').mouseenter(function(){
		if(!$(this).hasClass('ua-disabled') ) $(this).addClass('ua-dropdown-hover-state');

	}).mouseleave(function(){
		$(this).removeClass('ua-dropdown-hover-state');
	});

	$('.ua-menu').mousedown(function(){
		if(!$(this).hasClass('ua-disabled') )  $(this).find("ul").fadeIn(100).addClass("open-state");
	});

	$('.ua-menu ul').mouseleave(function(){
		submenuTimer = setTimeout("$('.open-state').hide(); $('.open-state').removeClass('open-state'); ", 200 );
    });
    $('.ua-menu li ul').mouseenter(function(){ clearTimeout(submenuTimer) });

	/* Search table */
	$('.ua-res-doc').live("mouseover", function(){
		$(this).addClass("ua-res-row-highlight");
		$(this).find(".resultTools").show();
	})
	.live("mouseout", function(){
		$(this).removeClass("ua-res-row-highlight");
		$(this).find(".resultTools").hide();
	});

	// custom css expression for a case-insensitive contains()
	jQuery.expr[':'].Contains = function(a,i,m){
	    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};

	/* Filter */
	setupFilterField();

});



 jQuery.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", 200);
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
}