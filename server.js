import http from 'node:http';import{randomBytes}from'node:crypto';import fs from'node:fs';
fs.mkdirSync('.runtime',{recursive:true});const file='.runtime/records.json';if(!fs.existsSync(file))fs.copyFileSync('data.json',file);const sessions=new Map();
const users={alex:'demo-alex-123',sam:'demo-sam-123'};
http.createServer(async(req,res)=>{const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};try{let body='';for await(const c of req)body+=c;const input=body?JSON.parse(body):{};
if(req.url==='/api/login'&&req.method==='POST'){if(users[input.username]!==input.password)return send(401,{error:'Invalid login'});const token=randomBytes(24).toString('hex');sessions.set(token,input.username);res.setHeader('Set-Cookie','session='+token+'; HttpOnly; SameSite=Strict; Path=/');return send(200,{user:input.username});}
const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('session='))?.slice(8);if(!sessions.has(token))return send(401,{error:'Login required'});
const rows=JSON.parse(fs.readFileSync(file));if(req.url==='/api/records'&&req.method==='GET')return send(200,rows);
if(req.url.startsWith('/api/records/')&&req.method==='PATCH'){const row=rows.find(x=>x.id===Number(req.url.split('/').pop()));if(!row)return send(404,{});if('quantity'in input){if(!Number.isInteger(input.quantity)||input.quantity<0)return send(400,{});row.quantity=input.quantity;}if('status'in input){if(!['New','Processing','Shipped'].includes(input.status))return send(400,{});row.status=input.status;}fs.writeFileSync(file,JSON.stringify(rows));return send(200,row);}send(404,{});
}catch(e){send(400,{error:'Invalid request'});}}).listen(3001,'127.0.0.1');
