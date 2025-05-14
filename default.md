# OpenAPI definition


**简介**:OpenAPI definition


**HOST**:http://localhost:8123/api


**联系人**:


**Version**:v0


**接口路径**:/api/v3/api-docs/default


[TOC]






# blog-controller


## get


**接口地址**:`/api/blog/get`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|blogId||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseBlogVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||BlogVO|BlogVO|
|&emsp;&emsp;id||integer(int64)||
|&emsp;&emsp;title||string||
|&emsp;&emsp;coverImg||string||
|&emsp;&emsp;content||string||
|&emsp;&emsp;thumbCount||integer(int32)||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;hasThumb||boolean||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"id": 0,
		"title": "",
		"coverImg": "",
		"content": "",
		"thumbCount": 0,
		"createTime": "",
		"hasThumb": true
	},
	"message": ""
}
```


## list


**接口地址**:`/api/blog/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseListBlogVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||array|BlogVO|
|&emsp;&emsp;id||integer(int64)||
|&emsp;&emsp;title||string||
|&emsp;&emsp;coverImg||string||
|&emsp;&emsp;content||string||
|&emsp;&emsp;thumbCount||integer(int32)||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;hasThumb||boolean||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": [
		{
			"id": 0,
			"title": "",
			"coverImg": "",
			"content": "",
			"thumbCount": 0,
			"createTime": "",
			"hasThumb": true
		}
	],
	"message": ""
}
```


# health-controller


## health


**接口地址**:`/api/health`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseString|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||string||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": "",
	"message": ""
}
```


# thumb-controller


## doThumb


**接口地址**:`/api/thumb/do`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "blogId": 0
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|doThumbRequest|DoThumbRequest|body|true|DoThumbRequest|DoThumbRequest|
|&emsp;&emsp;blogId|||false|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseBoolean|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||boolean||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": true,
	"message": ""
}
```


## undoThumb


**接口地址**:`/api/thumb/undo`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "blogId": 0
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|doThumbRequest|DoThumbRequest|body|true|DoThumbRequest|DoThumbRequest|
|&emsp;&emsp;blogId|||false|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseBoolean|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||boolean||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": true,
	"message": ""
}
```


# user-controller


## login


**接口地址**:`/api/user/login`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userId||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|BaseResponseUser|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|data||User|User|
|&emsp;&emsp;id||integer(int64)||
|&emsp;&emsp;username||string||
|&emsp;&emsp;password||string||
|&emsp;&emsp;email||string||
|&emsp;&emsp;displayName||string||
|&emsp;&emsp;avatarUrl||string||
|&emsp;&emsp;bio||string||
|&emsp;&emsp;status||object||
|&emsp;&emsp;emailVerified||integer(int32)||
|&emsp;&emsp;role||object||
|&emsp;&emsp;locale||string||
|&emsp;&emsp;timezone||string||
|&emsp;&emsp;createTime||string(date-time)||
|&emsp;&emsp;updateTime||string(date-time)||
|&emsp;&emsp;lastLoginAt||string(date-time)||
|&emsp;&emsp;socialProvider||string||
|&emsp;&emsp;socialId||string||
|&emsp;&emsp;metadata||object||
|message||string||


**响应示例**:
```javascript
{
	"code": 0,
	"data": {
		"id": 0,
		"username": "",
		"password": "",
		"email": "",
		"displayName": "",
		"avatarUrl": "",
		"bio": "",
		"status": {},
		"emailVerified": 0,
		"role": {},
		"locale": "",
		"timezone": "",
		"createTime": "",
		"updateTime": "",
		"lastLoginAt": "",
		"socialProvider": "",
		"socialId": "",
		"metadata": {}
	},
	"message": ""
}
```