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


| 参数名称 | 参数说明 | 请求类型 | 是否必须 | 数据类型       | schema |
| -------- | -------- | -------- | -------- | -------------- | ------ |
| blogId   |          | query    | true     | integer(int64) |        |


**响应状态**:


| 状态码 | 说明 | schema             |
| ------ | ---- | ------------------ |
| 200    | OK   | BaseResponseBlogVO |


**响应参数**:


| 参数名称               | 参数说明 | 类型              | schema         |
| ---------------------- | -------- | ----------------- | -------------- |
| code                   |          | integer(int32)    | integer(int32) |
| data                   |          | BlogVO            | BlogVO         |
| &emsp;&emsp;id         |          | integer(int64)    |                |
| &emsp;&emsp;title      |          | string            |                |
| &emsp;&emsp;coverImg   |          | string            |                |
| &emsp;&emsp;content    |          | string            |                |
| &emsp;&emsp;thumbCount |          | integer(int32)    |                |
| &emsp;&emsp;createTime |          | string(date-time) |                |
| &emsp;&emsp;hasThumb   |          | boolean           |                |
| message                |          | string            |                |


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


| 状态码 | 说明 | schema                 |
| ------ | ---- | ---------------------- |
| 200    | OK   | BaseResponseListBlogVO |


**响应参数**:


| 参数名称               | 参数说明 | 类型              | schema         |
| ---------------------- | -------- | ----------------- | -------------- |
| code                   |          | integer(int32)    | integer(int32) |
| data                   |          | array             | BlogVO         |
| &emsp;&emsp;id         |          | integer(int64)    |                |
| &emsp;&emsp;title      |          | string            |                |
| &emsp;&emsp;coverImg   |          | string            |                |
| &emsp;&emsp;content    |          | string            |                |
| &emsp;&emsp;thumbCount |          | integer(int32)    |                |
| &emsp;&emsp;createTime |          | string(date-time) |                |
| &emsp;&emsp;hasThumb   |          | boolean           |                |
| message                |          | string            |                |


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


| 状态码 | 说明 | schema             |
| ------ | ---- | ------------------ |
| 200    | OK   | BaseResponseString |


**响应参数**:


| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| code     |          | integer(int32) | integer(int32) |
| data     |          | string         |                |
| message  |          | string         |                |


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


| 参数名称           | 参数说明       | 请求类型 | 是否必须 | 数据类型       | schema         |
| ------------------ | -------------- | -------- | -------- | -------------- | -------------- |
| doThumbRequest     | DoThumbRequest | body     | true     | DoThumbRequest | DoThumbRequest |
| &emsp;&emsp;blogId |                |          | false    | integer(int64) |                |


**响应状态**:


| 状态码 | 说明 | schema              |
| ------ | ---- | ------------------- |
| 200    | OK   | BaseResponseBoolean |


**响应参数**:


| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| code     |          | integer(int32) | integer(int32) |
| data     |          | boolean        |                |
| message  |          | string         |                |


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


| 参数名称           | 参数说明       | 请求类型 | 是否必须 | 数据类型       | schema         |
| ------------------ | -------------- | -------- | -------- | -------------- | -------------- |
| doThumbRequest     | DoThumbRequest | body     | true     | DoThumbRequest | DoThumbRequest |
| &emsp;&emsp;blogId |                |          | false    | integer(int64) |                |


**响应状态**:


| 状态码 | 说明 | schema              |
| ------ | ---- | ------------------- |
| 200    | OK   | BaseResponseBoolean |


**响应参数**:


| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| code     |          | integer(int32) | integer(int32) |
| data     |          | boolean        |                |
| message  |          | string         |                |


**响应示例**:

```javascript
{
	"code": 0,
	"data": true,
	"message": ""
}
```


# user-controller


## getCurrentUserBlogs


**接口地址**:`/api/user/blogs`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型 | 是否必须 | 数据类型       | schema |
| -------- | -------- | -------- | -------- | -------------- | ------ |
| current  |          | query    | false    | integer(int64) |        |
| pageSize |          | query    | false    | integer(int64) |        |


**响应状态**:


| 状态码 | 说明 | schema               |
| ------ | ---- | -------------------- |
| 200    | OK   | BaseResponsePageBlog |


**响应参数**:


| 参数名称                           | 参数说明 | 类型           | schema         |
| ---------------------------------- | -------- | -------------- | -------------- |
| code                               |          | integer(int32) | integer(int32) |
| data                               |          | PageBlog       | PageBlog       |
| &emsp;&emsp;records                |          | array          | Blog           |
| &emsp;&emsp;&emsp;&emsp;id         |          | integer        |                |
| &emsp;&emsp;&emsp;&emsp;userid     |          | integer        |                |
| &emsp;&emsp;&emsp;&emsp;title      |          | string         |                |
| &emsp;&emsp;&emsp;&emsp;coverImg   |          | string         |                |
| &emsp;&emsp;&emsp;&emsp;content    |          | string         |                |
| &emsp;&emsp;&emsp;&emsp;thumbCount |          | integer        |                |
| &emsp;&emsp;&emsp;&emsp;createTime |          | string         |                |
| &emsp;&emsp;&emsp;&emsp;updateTime |          | string         |                |
| &emsp;&emsp;total                  |          | integer(int64) |                |
| &emsp;&emsp;size                   |          | integer(int64) |                |
| &emsp;&emsp;current                |          | integer(int64) |                |
| &emsp;&emsp;orders                 |          | array          | OrderItem      |
| &emsp;&emsp;&emsp;&emsp;column     |          | string         |                |
| &emsp;&emsp;&emsp;&emsp;asc        |          | boolean        |                |
| &emsp;&emsp;optimizeCountSql       |          | PageBlog       | PageBlog       |
| &emsp;&emsp;searchCount            |          | PageBlog       | PageBlog       |
| &emsp;&emsp;optimizeJoinOfCountSql |          | boolean        |                |
| &emsp;&emsp;maxLimit               |          | integer(int64) |                |
| &emsp;&emsp;countId                |          | string         |                |
| &emsp;&emsp;pages                  |          | integer(int64) |                |
| message                            |          | string         |                |


**响应示例**:

```javascript
{
	"code": 0,
	"data": {
		"records": [
			{
				"id": 0,
				"userid": 0,
				"title": "",
				"coverImg": "",
				"content": "",
				"thumbCount": 0,
				"createTime": "",
				"updateTime": ""
			}
		],
		"total": 0,
		"size": 0,
		"current": 0,
		"orders": [
			{
				"column": "",
				"asc": true
			}
		],
		"optimizeCountSql": {},
		"searchCount": {},
		"optimizeJoinOfCountSql": true,
		"maxLimit": 0,
		"countId": "",
		"pages": 0
	},
	"message": ""
}
```


## getCurrentUser


**接口地址**:`/api/user/current`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema             |
| ------ | ---- | ------------------ |
| 200    | OK   | BaseResponseUserVO |


**响应参数**:


| 参数名称                        | 参数说明 | 类型           | schema         |
| ------------------------------- | -------- | -------------- | -------------- |
| code                            |          | integer(int32) | integer(int32) |
| data                            |          | UserVO         | UserVO         |
| &emsp;&emsp;id                  |          | integer(int64) |                |
| &emsp;&emsp;username            |          | string         |                |
| &emsp;&emsp;email               |          | string         |                |
| &emsp;&emsp;displayName         |          | string         |                |
| &emsp;&emsp;avatarUrl           |          | string         |                |
| &emsp;&emsp;bio                 |          | string         |                |
| &emsp;&emsp;status              |          | object         |                |
| &emsp;&emsp;emailVerified       |          | integer(int32) |                |
| &emsp;&emsp;role                |          | object         |                |
| &emsp;&emsp;locale              |          | string         |                |
| &emsp;&emsp;timezone            |          | string         |                |
| &emsp;&emsp;lastLoginIpLocation |          | string         |                |
| message                         |          | string         |                |


**响应示例**:

```javascript
{
	"code": 0,
	"data": {
		"id": 0,
		"username": "",
		"email": "",
		"displayName": "",
		"avatarUrl": "",
		"bio": "",
		"status": {},
		"emailVerified": 0,
		"role": {},
		"locale": "",
		"timezone": "",
		"lastLoginIpLocation": ""
	},
	"message": ""
}
```


## userLogin


**接口地址**:`/api/user/login`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "",
  "password": ""
}
```


**请求参数**:


| 参数名称             | 参数说明         | 请求类型 | 是否必须 | 数据类型         | schema           |
| -------------------- | ---------------- | -------- | -------- | ---------------- | ---------------- |
| userLoginRequest     | UserLoginRequest | body     | true     | UserLoginRequest | UserLoginRequest |
| &emsp;&emsp;username |                  |          | true     | string           |                  |
| &emsp;&emsp;password |                  |          | true     | string           |                  |


**响应状态**:


| 状态码 | 说明 | schema           |
| ------ | ---- | ---------------- |
| 200    | OK   | BaseResponseUser |


**响应参数**:


| 参数名称                        | 参数说明 | 类型              | schema         |
| ------------------------------- | -------- | ----------------- | -------------- |
| code                            |          | integer(int32)    | integer(int32) |
| data                            |          | User              | User           |
| &emsp;&emsp;id                  |          | integer(int64)    |                |
| &emsp;&emsp;username            |          | string            |                |
| &emsp;&emsp;password            |          | string            |                |
| &emsp;&emsp;email               |          | string            |                |
| &emsp;&emsp;displayName         |          | string            |                |
| &emsp;&emsp;avatarUrl           |          | string            |                |
| &emsp;&emsp;bio                 |          | string            |                |
| &emsp;&emsp;status              |          | object            |                |
| &emsp;&emsp;emailVerified       |          | integer(int32)    |                |
| &emsp;&emsp;role                |          | object            |                |
| &emsp;&emsp;locale              |          | string            |                |
| &emsp;&emsp;timezone            |          | string            |                |
| &emsp;&emsp;createTime          |          | string(date-time) |                |
| &emsp;&emsp;updateTime          |          | string(date-time) |                |
| &emsp;&emsp;lastLoginAt         |          | string(date-time) |                |
| &emsp;&emsp;socialProvider      |          | string            |                |
| &emsp;&emsp;socialId            |          | string            |                |
| &emsp;&emsp;metadata            |          | object            |                |
| &emsp;&emsp;lastLoginIp         |          | string            |                |
| &emsp;&emsp;lastLoginIpLocation |          | string            |                |
| message                         |          | string            |                |


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
		"metadata": {},
		"lastLoginIp": "",
		"lastLoginIpLocation": ""
	},
	"message": ""
}
```


## logout


**接口地址**:`/api/user/logout`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema             |
| ------ | ---- | ------------------ |
| 200    | OK   | BaseResponseString |


**响应参数**:


| 参数名称 | 参数说明 | 类型           | schema         |
| -------- | -------- | -------------- | -------------- |
| code     |          | integer(int32) | integer(int32) |
| data     |          | string         |                |
| message  |          | string         |                |


**响应示例**:

```javascript
{
	"code": 0,
	"data": "",
	"message": ""
}
```


## userRegister


**接口地址**:`/api/user/register`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "",
  "password": "",
  "confirmPassword": ""
}
```


**请求参数**:


| 参数名称                    | 参数说明            | 请求类型 | 是否必须 | 数据类型            | schema              |
| --------------------------- | ------------------- | -------- | -------- | ------------------- | ------------------- |
| userRegisterRequest         | UserRegisterRequest | body     | true     | UserRegisterRequest | UserRegisterRequest |
| &emsp;&emsp;username        |                     |          | true     | string              |                     |
| &emsp;&emsp;password        |                     |          | true     | string              |                     |
| &emsp;&emsp;confirmPassword |                     |          | true     | string              |                     |


**响应状态**:


| 状态码 | 说明 | schema           |
| ------ | ---- | ---------------- |
| 200    | OK   | BaseResponseUser |


**响应参数**:


| 参数名称                        | 参数说明 | 类型              | schema         |
| ------------------------------- | -------- | ----------------- | -------------- |
| code                            |          | integer(int32)    | integer(int32) |
| data                            |          | User              | User           |
| &emsp;&emsp;id                  |          | integer(int64)    |                |
| &emsp;&emsp;username            |          | string            |                |
| &emsp;&emsp;password            |          | string            |                |
| &emsp;&emsp;email               |          | string            |                |
| &emsp;&emsp;displayName         |          | string            |                |
| &emsp;&emsp;avatarUrl           |          | string            |                |
| &emsp;&emsp;bio                 |          | string            |                |
| &emsp;&emsp;status              |          | object            |                |
| &emsp;&emsp;emailVerified       |          | integer(int32)    |                |
| &emsp;&emsp;role                |          | object            |                |
| &emsp;&emsp;locale              |          | string            |                |
| &emsp;&emsp;timezone            |          | string            |                |
| &emsp;&emsp;createTime          |          | string(date-time) |                |
| &emsp;&emsp;updateTime          |          | string(date-time) |                |
| &emsp;&emsp;lastLoginAt         |          | string(date-time) |                |
| &emsp;&emsp;socialProvider      |          | string            |                |
| &emsp;&emsp;socialId            |          | string            |                |
| &emsp;&emsp;metadata            |          | object            |                |
| &emsp;&emsp;lastLoginIp         |          | string            |                |
| &emsp;&emsp;lastLoginIpLocation |          | string            |                |
| message                         |          | string            |                |


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
		"metadata": {},
		"lastLoginIp": "",
		"lastLoginIpLocation": ""
	},
	"message": ""
}
```


## updateUserInfo


**接口地址**:`/api/user/update`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "displayName": "",
  "avatarUrl": "",
  "bio": "",
  "email": ""
}
```


**请求参数**:


| 参数名称                | 参数说明          | 请求类型 | 是否必须 | 数据类型          | schema            |
| ----------------------- | ----------------- | -------- | -------- | ----------------- | ----------------- |
| userUpdateRequest       | UserUpdateRequest | body     | true     | UserUpdateRequest | UserUpdateRequest |
| &emsp;&emsp;displayName |                   |          | false    | string            |                   |
| &emsp;&emsp;avatarUrl   |                   |          | false    | string            |                   |
| &emsp;&emsp;bio         |                   |          | false    | string            |                   |
| &emsp;&emsp;email       |                   |          | false    | string            |                   |


**响应状态**:


| 状态码 | 说明 | schema           |
| ------ | ---- | ---------------- |
| 200    | OK   | BaseResponseUser |


**响应参数**:


| 参数名称                        | 参数说明 | 类型              | schema         |
| ------------------------------- | -------- | ----------------- | -------------- |
| code                            |          | integer(int32)    | integer(int32) |
| data                            |          | User              | User           |
| &emsp;&emsp;id                  |          | integer(int64)    |                |
| &emsp;&emsp;username            |          | string            |                |
| &emsp;&emsp;password            |          | string            |                |
| &emsp;&emsp;email               |          | string            |                |
| &emsp;&emsp;displayName         |          | string            |                |
| &emsp;&emsp;avatarUrl           |          | string            |                |
| &emsp;&emsp;bio                 |          | string            |                |
| &emsp;&emsp;status              |          | object            |                |
| &emsp;&emsp;emailVerified       |          | integer(int32)    |                |
| &emsp;&emsp;role                |          | object            |                |
| &emsp;&emsp;locale              |          | string            |                |
| &emsp;&emsp;timezone            |          | string            |                |
| &emsp;&emsp;createTime          |          | string(date-time) |                |
| &emsp;&emsp;updateTime          |          | string(date-time) |                |
| &emsp;&emsp;lastLoginAt         |          | string(date-time) |                |
| &emsp;&emsp;socialProvider      |          | string            |                |
| &emsp;&emsp;socialId            |          | string            |                |
| &emsp;&emsp;metadata            |          | object            |                |
| &emsp;&emsp;lastLoginIp         |          | string            |                |
| &emsp;&emsp;lastLoginIpLocation |          | string            |                |
| message                         |          | string            |                |


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
		"metadata": {},
		"lastLoginIp": "",
		"lastLoginIpLocation": ""
	},
	"message": ""
}
```


## updatePassword


**接口地址**:`/api/user/update/password`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "oldPassword": "",
  "newPassword": "",
  "confirmPassword": ""
}
```


**请求参数**:


| 参数名称                    | 参数说明                  | 请求类型 | 是否必须 | 数据类型                  | schema                    |
| --------------------------- | ------------------------- | -------- | -------- | ------------------------- | ------------------------- |
| userUpdatePasswordRequest   | UserUpdatePasswordRequest | body     | true     | UserUpdatePasswordRequest | UserUpdatePasswordRequest |
| &emsp;&emsp;oldPassword     |                           |          | true     | string                    |                           |
| &emsp;&emsp;newPassword     |                           |          | true     | string                    |                           |
| &emsp;&emsp;confirmPassword |                           |          | true     | string                    |                           |


**响应状态**:


| 状态码 | 说明 | schema           |
| ------ | ---- | ---------------- |
| 200    | OK   | BaseResponseUser |


**响应参数**:


| 参数名称                        | 参数说明 | 类型              | schema         |
| ------------------------------- | -------- | ----------------- | -------------- |
| code                            |          | integer(int32)    | integer(int32) |
| data                            |          | User              | User           |
| &emsp;&emsp;id                  |          | integer(int64)    |                |
| &emsp;&emsp;username            |          | string            |                |
| &emsp;&emsp;password            |          | string            |                |
| &emsp;&emsp;email               |          | string            |                |
| &emsp;&emsp;displayName         |          | string            |                |
| &emsp;&emsp;avatarUrl           |          | string            |                |
| &emsp;&emsp;bio                 |          | string            |                |
| &emsp;&emsp;status              |          | object            |                |
| &emsp;&emsp;emailVerified       |          | integer(int32)    |                |
| &emsp;&emsp;role                |          | object            |                |
| &emsp;&emsp;locale              |          | string            |                |
| &emsp;&emsp;timezone            |          | string            |                |
| &emsp;&emsp;createTime          |          | string(date-time) |                |
| &emsp;&emsp;updateTime          |          | string(date-time) |                |
| &emsp;&emsp;lastLoginAt         |          | string(date-time) |                |
| &emsp;&emsp;socialProvider      |          | string            |                |
| &emsp;&emsp;socialId            |          | string            |                |
| &emsp;&emsp;metadata            |          | object            |                |
| &emsp;&emsp;lastLoginIp         |          | string            |                |
| &emsp;&emsp;lastLoginIpLocation |          | string            |                |
| message                         |          | string            |                |


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
		"metadata": {},
		"lastLoginIp": "",
		"lastLoginIpLocation": ""
	},
	"message": ""
}
```