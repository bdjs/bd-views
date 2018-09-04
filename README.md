# bd-views
Template rendering middleware for bd

```shell
npm install --save bd-views@next
```

## Updated

use `koa2.x`, faster and stronger.


This repository began as a GitHub fork of [queckezz/koa-views](https://github.com/queckezz/koa-views).

## Usage

```javascript
router.get(async ctx => {
  ctx.setState({
    name: 'Niko'
  })
  ctx.setState({
    age: 18
  })

  await ctx.render('index.ejs')
})

// equals

router.get(async ctx => {
  await ctx.render('index.ejs', {
    name: 'Niko',
    age: 18
  })
})
```