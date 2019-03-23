Welcome to the Node wiki! Here you will find various information about this repo.

## Node 

* [how to create a fullstack with another of our repos](https://github.com/weareopensource/weareopensource.github.io/wiki)

## Doc 

* [Api](https://github.com/weareopensource/Node/blob/master/WIKI.md#API)
* [Errors](https://github.com/weareopensource/Node/blob/master/WIKI.md#Errors)

## Other informations

* [Knowledges](https://github.com/weareopensource/Node/blob/master/KNOWLEDGES.md)
* [Changelog](https://github.com/weareopensource/Node/blob/master/CHANGELOG.md)
* [Licence](https://github.com/weareopensource/Node/blob/master/LICENSE.md)
* [Contribute](https://github.com/weareopensource/weareopensource.github.io/wiki/Contribute)

## WAOS

* [Our Mindset](https://weareopensource.me/introduction/)
* [Our Roadmap](https://github.com/weareopensource/weareopensource.github.io/projects)
* [Us](https://github.com/weareopensource/weareopensource.github.io/wiki/Us)
* [Help Us](https://github.com/weareopensource/weareopensource.github.io/wiki/HelpUs)

# Doc

## API

### API answers rules : 

#### success

`responses.success(res, 'task created')({});`

body : 

```
{ 
	type: 'success', 
	message: 'task created' 
	data: {}
}
```

#### error

`responses.error(res, 422, 'task creation failed')({err});`

body : 

```
{ 
	type: 'error', 
	message: 'task creation failed' 
	error: {err}
}
```

## Errors

#### controller

`responses.error(res, 422, errors.getMessage(err))({err});`

body : 

```
{ 
	type: 'error', 
	message: 'task creation failed' 
	error: {err}
}
```

#### schema errors

`responses.error(res, 422, errors.getMessage(err))({err});`

body : 

```
{ 
	type: 'error',
   message: 'schema validation error',
   error: { 
       original: { 
            title: 2, 
            description: 'do something about something else' 
       },
       details: [{ 
       	message: 'title must be a string', 
       	type: 'string.base' 
       } ] 
   } 
}
```

#### service & others errors

`throw new AppError('invalid user or password');`

body : 

```
{ 
	type: 'error',
   message: 'Something went wrong',
   error: { 
       details: [{ 
       	message: 'invalid user or password', 
       }] 
   } 
}
```

#### Authentication errors

status : 401 
error : 

```
{
	text: 'Unauthorized'
}
```