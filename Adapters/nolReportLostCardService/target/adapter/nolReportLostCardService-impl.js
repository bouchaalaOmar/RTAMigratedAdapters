
function reportLostCard(language,userId,params) {

	var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.rta.ae/ActiveMatrix/ESB/CustomHeader/XMLSchema/" xmlns:xs1="http://www.rta.ae/ActiveMatrix/ESB/ReportLostCardService/XMLSchema">'
		+getHeader(language,userId)
		+'<soapenv:Body>'
			+'<xs1:lostCardSubmitRequest>'
				+jsonToXml(params,'', null)	
		    +'</xs1:lostCardSubmitRequest>'
		+'</soapenv:Body>'
	+'</soapenv:Envelope>';
	
	var result = invokeWebService(request,"reportLostCard");
	
	return result;

}


function trackLostCardStatus(language,userId,params) {

	var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.rta.ae/ActiveMatrix/ESB/CustomHeader/XMLSchema/" xmlns:xs1="http://www.rta.ae/ActiveMatrix/ESB/ReportLostCardService/XMLSchema">'
		+getHeader(language,userId)
		+'<soapenv:Body>'
			+'<xs1:trackLostCardStatusRequest>'
				+jsonToXml(params,'', null)	
		    +'</xs1:trackLostCardStatusRequest>'
		+'</soapenv:Body>'
	+'</soapenv:Envelope>';
	
	var result = invokeWebService(request,"trackLostCardStatus");
	
	return result;
}

function validateLostCard(language,userId,params) {

	var request = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xs="http://www.rta.ae/ActiveMatrix/ESB/CustomHeader/XMLSchema/" xmlns:xs1="http://www.rta.ae/ActiveMatrix/ESB/ReportLostCardService/XMLSchema">'
		+getHeader(language,userId)
		+'<soapenv:Body>'
			+'<xs1:lostCardValidationRequest>'
				+jsonToXml(params,'', null)	
		    +'</xs1:lostCardValidationRequest>'
		+'</soapenv:Body>'
	+'</soapenv:Envelope>';
	
	var result = invokeWebService(request,"validateLostCard");
//	return result={
//	result:result,
//	request:request
//}
	return result;
}

function getHeader(language,userId){
	
	var header = 
		'<soapenv:Header>'
			+getWSSE()
			+'<xs:CustomHeader>'
				+'<xs:Language>'+language+'</xs:Language>'
				+'<xs:UserId>'+userId+'</xs:UserId>'     
			+'</xs:CustomHeader>'
		+'</soapenv:Header>';
	
	return header;
}

function getWSSE(){
	var wsse = 
		'<wsse:Security soapenv:mustUnderstand="0" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
			+'<wsse:UsernameToken wsu:Id="UsernameToken-69">'
				+'<wsse:Username>'+MFP.Server.getPropertyValue("wsse.tibco.username")+'</wsse:Username>'
				+'<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+MFP.Server.getPropertyValue("wsse.tibco.password")+'</wsse:Password>'
			+'</wsse:UsernameToken>'
		+'</wsse:Security>';
	
	return wsse;
}

function getAttributes(jsonObj) {
	var attrStr = '';
	for(var attr in jsonObj) {
		var val = jsonObj[attr];
		if (attr.charAt(0) == '@') {
			attrStr += ' ' + attr.substring(1);
			attrStr += '="' + val + '"';
		}
	}
	return attrStr;
}

function jsonToXml(jsonObj, xmlStr, namespaces) {
	var toAppend = '';
	for(var attr in jsonObj) {
		var val = jsonObj[attr];
		if (attr.charAt(0) != '@') {
			toAppend += "<" + attr;
			if (typeof val  === 'object') {
				toAppend += getAttributes(val);
				if (namespaces != null)
					toAppend += ' ' + namespaces;
				toAppend += ">\n";
				toAppend = jsonToXml(val, toAppend);
			}
			else {
				toAppend += ">" + val;
			}
			toAppend += "</" + attr + ">\n";
		}
	}
	return xmlStr += toAppend;
}

function invokeWebService(request,soapAction){
	var invokeReferenceId = "ME"+new Date().getTime()+Math.floor((Math.random() * 100) + 1);
	try {
		MFP.Logger.info("["+soapAction +"][Request]["+invokeReferenceId+"] \r\n"+ request.toString());
		
	    var input = {
	        method : 'post',
	        returnedContentType : 'xml',
	        path : "reportlostcard",
	        headers:{SOAPAction:soapAction},
	        body: {
	            content : request.toString(),
	            contentType : 'text/xml; charset=UTF-8'
	        }
	    };
	    var response = MFP.Server.invokeHttp(input);
	    
		MFP.Logger.info("["+soapAction+"][Response]["+invokeReferenceId+"] \r\n"+JSON.stringify(response, null, '\t'));
	    
	    if(response.Envelope){
			response.Envelope.Body.invokeReferenceId = invokeReferenceId;
			
		    return response.Envelope.Body;
	    }else{
	    	response.invokeReferenceId = invokeReferenceId;
	    	
		    return response;
	    }
	    
	}catch(err) {
		MFP.Logger.error("["+soapAction+"][Error]["+invokeReferenceId+"]: "+err);
		return {error:err,isSuccessful:false,invokeReferenceId:invokeReferenceId};
	}
}
