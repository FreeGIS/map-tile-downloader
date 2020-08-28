 const zRegEx = /\{z\}/g;
 const xRegEx = /\{x\}/g;
 const yRegEx = /\{y\}/g;
  
 function getTileUrl(template,xyz,tokenOption){
	 let match = /\{([a-z])-([a-z])\}/.exec(template);
	 if (match) {
		const startCharCode = match[1].charCodeAt(0);
		const stopCharCode = match[2].charCodeAt(0);
		let charCode=String.fromCharCode(getRandomServiceId(startCharCode,stopCharCode));
		template=template.replace(match[0], charCode);
	 } else {
		match = match = /\{(\d+)-(\d+)\}/.exec(template);
		if (match) {
		   const start = parseInt(match[1], 10);
		   const stop = parseInt(match[2], 10);
		   let charCode=getRandomServiceId(start,stop);
		   template=template.replace(match[0], charCode.toString());
	   }
	 }
	
	let url=template.replace(zRegEx, xyz[0].toString())
	.replace(xRegEx, xyz[1].toString())
	.replace(yRegEx, xyz[2].toString());
	//设置一些token什么的
	if(tokenOption){
		const token_key=tokenOption.key;
		const token_value=getRandomToken(tokenOption.values);
		if(url.includes('?'))
			url=`${url}&${token_key}=${token_value}`;
		else
			url=`${url}?${token_key}=${token_value}`;
	}
	return url;
  }
  
  //获取随机的地图服务器代号，从而减少对爬取服务器的压力
 function getRandomServiceId(startcode,endcode){
	let strcode=startcode+Math.round(Math.random()*(endcode-startcode));
	return strcode;
 }
 //获取随机token
 function getRandomToken(tokens){
	const token_length=tokens.length;
	let _index=Math.round(Math.random()*(token_length-1));
	return tokens[_index];
}
module.exports = getTileUrl;