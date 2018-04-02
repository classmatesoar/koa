var koa = require('koa');
var app = new koa();
var router = require('koa-router')();
// CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。
// 下面以koa2-cors为例，
const cors = require('koa2-cors');

const bodyParser = require('koa-bodyparser');

app.use(bodyParser());
// 具体参数我们在后面进行解释
app.use(cors({
    origin: function (ctx) {
        if (ctx.url === '/test') {
            return "*"; // 允许来自所有域名请求
        } else {
            return '*';
        }
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 1728000,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))


/*======================================================================*/
const menubar = require('./data/menubar.json');
const personInfo = require('./data/personnInfo.json');
const viewMode = require('./data/viewMode.json');
const viewDetails = require('./data/viewDetails.json');
const viewDetailsForm = require('./data/viewDetailsForm.json');
let ticketArr = ["000"];
const checkTicket = () => {
    const ticket = new Date().getTime() * Math.random();
    if (ticketArr.indexOf(ticket) == -1) {
        ticketArr.push(ticket)
        return ticket
    } else {
        return checkTicket()
    }
}

/*========================================================================*/
router.get('/*', async function (ctx) {
    const query = ctx.query;
    ctx.body = {
        status:200,
        thisType: 'get'+'-'+ctx.url
    }
})
router.post('/*', async function (ctx) {
    ctx.body = {
        status:200,
        thisType: 'post'+'-'+ctx.url
    }
})
router.delete('/*', async function (ctx) {
    const query = ctx.request.body;
    ctx.body = {
        status:200,
        thisType: 'delete'+'-'+ctx.url
    }
})
router.put('/*', async function (ctx) {
    ctx.body = {
        status:200,
        thisType: 'put'+'-'+ctx.url
    }
})
/*========================================================================*/
router.post('/menubar', async function (ctx) {
    let result = {
        status: 200
    }
    result.data = menubar
    ctx.body = result
});
router.post('/loginIn', async function (ctx) {
    let result = {
        status: 200
    }
    const query = ctx.request.body;
    const name = query.name;
    const pwd = query.pwd;
    const base_result = personInfo[0];
    const change_result = personInfo[1];
    const res_result = (base_result[name] === undefined ? base_result[change_result[name]] : base_result[name]);
    if (res_result) {
        if (res_result.pwd === pwd) {
            let obj = { ...res_result, DATA: ctx };
            let thisTicket = checkTicket();
            delete obj.pwd;
            obj.ticket = checkTicket();
            console.info(ticketArr);
            result.data = obj;
        } else {
            result.status = 400;
            result.msg = '用户名或密码错误';
        }
    } else {
        result.status = 400;
        result.msg = '用户名或密码错误';
    }
    ctx.body = result;
})
router.post('/loginOut', async function (ctx) {
    let result = {
        status: 200
    };
    const query = ctx.request.body;
    const ticket = query.ticket;
    ticketArr = ticketArr.splice(ticketArr.indexOf(ticket), 1);
    console.info(ticketArr);
    result.msg = 'ticket已注销';
    ctx.body = result
})
router.post('*', async function (ctx) {
    let result = {
        status: 200
    };
    const query = ctx.request.body;
    const ticket = query.ticket;
    const mode = query.mode;
    let page = query.page;
    let size = query.size;
    if (ticket) {
        if (ticketArr.indexOf(ticket) != -1) {
            if (ticket != "000") {

                if (mode) {
                    console.log(ticket, mode)
                    result.formItems = viewDetailsForm,
                        result.data = {

                        }
                } else {
                    if (!page) {
                        page = 1
                    }
                    if (!size) {
                        size = 10
                    }
                    let thisMode = viewMode[ctx.url];
                    thisMode === undefined ? (thisMode = []) : true;
                    result.patterns = thisMode;
                    result.tableData = viewDetails.slice((page - 1) * size, page * size);
                    result.total = viewDetails.length;
                }
            } else {
                result.status = 204,
                    result.msg = '游客无权限获取数据'
            }
        } else {
            result.status = 500,
                result.msg = '登陆凭证过期'
        }
    } else {
        result.status = 500,
            result.msg = '缺少登陆凭证'
    }
    ctx.body = result
});
/*======================================================================*/
router.get('*', async function (ctx) {
    let result = {
        status: 200
    }
    ctx.response.status = 404;
    result.url = ctx.url;
    ctx.body = result
});
/*======================================================================*/

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(8888, () => {
    console.log('come on')
});