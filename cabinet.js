'use strict';
/* Public sandbox. Only synthetic fixtures; no real identity, network, upload or scoring. */
const $=id=>document.getElementById(id);
const names=['Вход','Заявка','Документы','Проверка','Предложения','Договор'];
const labels={company:'Организация (ООО)',ip:'Индивидуальный предприниматель',person:'Физическое лицо'};
const docs={company:['Реквизиты организации','Полномочия представителя','Финансовые сведения','Предложение поставщика'],ip:['Регистрационные сведения','Учебный документ личности','Сведения об оборотах','Предложение поставщика'],person:['Учебный документ личности','Сведения о доходах','Предложение поставщика']};
function initial(){return {step:0,furthest:0,identity:false,kind:'company',asset:'Оборудование',pd:false,documents:[],creditConsent:false,credit:'idle',selected:null,signed:false,submitted:false,history:['Открыт учебный кабинет']}}
let state=initial();
const entry=t=>state.history.push(t);
function el(tag,txt,cls){const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x}
function button(t,fn,primary=false,disabled=false,id=''){const b=el('button',t,'btn'+(primary?' primary':''));b.type='button';b.disabled=disabled;if(id)b.id=id;b.addEventListener('click',fn);return b}
function choice(t,checked,fn,id){const l=el('label',undefined,'choice'),c=el('input');c.type='checkbox';c.checked=checked;if(id)c.id=id;c.addEventListener('change',()=>fn(c.checked));l.append(c,document.createTextNode(t));return l}
function select(label,values,value,fn,id){const d=el('div',undefined,'field'),l=el('label',label),s=el('select');s.id=id;l.htmlFor=id;Object.entries(values).forEach(([v,t])=>{let o=el('option',t);o.value=v;s.append(o)});s.value=value;s.onchange=()=>fn(s.value);d.append(l,s);return d}
function heading(v,title,sub){v.append(el('h2',title),el('p',sub,'muted'))}
function buttons(v,...items){const d=el('div',undefined,'buttons');d.append(...items);v.append(d)}
function msg(t){$('status').textContent=t}
function go(n){if(n<0||n>5||n>state.furthest)return;state.step=n;render();window.scrollTo({top:0,behavior:'instant'})}
function advance(n){state.furthest=Math.max(state.furthest,n);go(n)}
function saveFile(title,text){const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=title;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function reset(){state=initial();render();msg('Учебная сессия очищена.')}
function render(){
 const v=$('view');v.replaceChildren();$('steps').replaceChildren(...names.map((t,i)=>{let li=el('li'),b=button('',()=>go(i),false,i>state.furthest);b.className=i<state.furthest?'done':'';b.append(el('span',i<state.furthest?'✓':String(i+1),'num'),el('span',t));if(i===state.step)b.setAttribute('aria-current','step');li.append(b);return li}));
 const completed=state.signed?6:state.furthest;$('progress').style.width=(completed/6*100)+'%';$('progress').parentElement.setAttribute('aria-valuenow',String(completed));$('progressText').textContent='Выполнено '+completed+' из 6 этапов';$('history').replaceChildren(...state.history.map(t=>el('li',t)));
 if(state.step===0){
 heading(v,'Вход в тестовый кабинет','В рабочей версии — подтверждение контакта и защищённая сессия. Сейчас используем только встроенную учебную личность.');
 const d=el('div',undefined,'item');d.append(el('small','Профиль'),el('strong','Учебный клиент LK-DEMO'));v.append(d);
 buttons(v,button('Войти как тестовый клиент',()=>{state.identity=true;entry('Учебная идентификация завершена (не реальная)');advance(1)},true,state.identity,'demoLogin'),button('Продолжить',()=>go(1),false,!state.identity));
 }else if(state.step===1){
 heading(v,'Подготовка заявки','Выберите тип клиента и имущество. Для демонстрации используются готовые вымышленные реквизиты.');
 v.append(select('Категория',labels,state.kind,x=>{state.kind=x;state.documents=[];state.creditConsent=false;state.credit='idle';state.selected=null;state.signed=false;state.submitted=false;state.pd=false;state.furthest=1;entry('Изменена категория, последующие этапы сброшены');render()},'kind'),select('Имущество',{'Оборудование':'Оборудование','Автомобиль':'Автомобиль','Спецтехника':'Спецтехника'},state.asset,x=>{state.asset=x;state.creditConsent=false;state.credit='idle';state.selected=null;state.signed=false;state.submitted=false;state.furthest=1;render()},'asset'));
 const d=el('div',undefined,'stats');[['Стоимость','4 500 000 ₽'],['Аванс','20%'],['Срок','36 мес.']].forEach(([a,b])=>{let x=el('div');x.append(el('small',a),el('strong',b));d.append(x)});v.append(d,choice('Подтверждаю тестовое согласие на обработку данных (без юридической силы)',state.pd,x=>{state.pd=x;if(!x){state.submitted=false;state.creditConsent=false;state.credit='idle';state.selected=null;state.signed=false;state.furthest=1}render()},'pd'));
 const link=el('a','Проект согласия');link.href='./consent.html';v.append(link);
 buttons(v,button('Сохранить учебную заявку',()=>{if(!state.identity||!state.pd)return;state.submitted=true;entry('Тестовая заявка LK-DEMO-001 подготовлена');advance(2)},true,!state.pd||!state.identity,'saveApplication'));
 }else if(state.step===2){
 heading(v,'Документы','Добавляйте только встроенные учебные документы. Выбор реальных файлов намеренно недоступен в публичном тесте.');
 docs[state.kind].forEach((t,i)=>{const d=el('div',undefined,'document'),a=el('div');a.append(el('strong',t),el('small',state.documents.includes(i)?'Учебный файл добавлен':'Ожидается'));d.append(a,button(state.documents.includes(i)?'Удалить':'Добавить образец',()=>{if(state.documents.includes(i)){state.documents=state.documents.filter(x=>x!==i);state.creditConsent=false;state.credit='idle';state.selected=null;state.signed=false;state.furthest=2}else state.documents.push(i);entry('Учебный документ: '+t);render()},false,false,'doc'+i));v.append(d)});
 buttons(v,button('Скачать пример файла',()=>saveFile('LK_DEMO_document.txt','УЧЕБНЫЙ ОБРАЗЕЦ\nНе является документом клиента.')),button('Далее к проверке',()=>advance(3),true,state.documents.length!==docs[state.kind].length,'toCredit'));
 }else if(state.step===3){
 heading(v,'Проверка сведений','Идентификация и запрос кредитного отчёта — отдельные операции. Здесь имитируется только обмен статусами, без доступа к БКИ.');
 const d=el('details'),sum=el('summary','Условия тестового запроса кредитного отчёта');d.append(sum,el('p','Субъект: учебный клиент. Получатель: ИП Гасанов Тариэль Алиевич (планируемый пользователь БКИ, право доступа подлежит проверке). Цель: рассмотрение заявки на лизинг. Это не юридически значимое согласие и не разрешение на реальный запрос.'));v.append(d);
 v.append(choice('Отдельно подтверждаю тестовый запрос кредитного отчёта',state.creditConsent,x=>{state.creditConsent=x;if(!x){state.credit='idle';state.selected=null;state.signed=false;state.furthest=3;entry('Тестовое согласие отозвано')}render()},'creditConsent'));
 if(state.credit==='idle')buttons(v,button('Запустить тестовую проверку',()=>{if(!state.creditConsent||!state.pd||!state.identity||!state.submitted)return;state.credit='pending';entry('Тестовый запрос создан');render();msg('Запрос помещён в учебную очередь.')},true,!state.creditConsent,'requestCredit'));
 if(state.credit==='pending'){v.append(el('p','Статус: запрос обрабатывается','status'));buttons(v,button('Получить учебный ответ',()=>{state.credit='review';entry('Тестовый ответ получен; передано специалисту');render();msg('Учебный ответ получен. Решение о финансировании не принято.')},true,false,'receiveCredit'))}
 if(state.credit==='review'){v.append(el('p','Статус: сведения получены, требуется рассмотрение специалистом. Кредитный рейтинг не вычисляется.','status'));buttons(v,button('Посмотреть учебные предложения',()=>{entry('Открыты условные сценарии');advance(4)},true,false,'toOffers'))}
 }else if(state.step===4){
 heading(v,'Сравнение предложений','Два вымышленных сценария. Реальные предложения появятся только после получения ответов партнёров.');
 [{id:'A',n:'Сценарий 1',p:'130 000 ₽ / мес.',total:'5 581 000 ₽'},{id:'B',n:'Сценарий 2',p:'128 000 ₽ / мес.',total:'5 638 000 ₽'}].forEach(o=>{const d=el('div',undefined,'offer'+(state.selected===o.id?' selected':''));d.append(el('h3',o.n),el('div',o.p,'amount'),el('p','Номинальные расходы: '+o.total),button(state.selected===o.id?'Выбрано':'Выбрать сценарий',()=>{if(state.selected!==o.id){state.selected=o.id;state.signed=false;state.furthest=4;entry('Выбран учебный '+o.n.toLowerCase());render()}},state.selected!==o.id,false,'offer'+o.id));v.append(d)});
 buttons(v,button('Подготовить проект договора',()=>advance(5),true,!state.selected,'toContract'));
 }else{
 heading(v,'Договор и сопровождение','Пример электронного документооборота. Подписание имеет исключительно демонстрационный характер.');
 v.append(el('p','Выбран сценарий '+(state.selected==='A'?'1':'2')+'. '+(state.signed?'Учебное подтверждение получено.':'Ожидается ознакомление.'),'status'));
 buttons(v,button('Скачать учебный проект',()=>saveFile('LK_DEMO_contract.txt','УЧЕБНЫЙ ПРОЕКТ\nLK-DEMO-001\nСценарий '+state.selected+'\nНе договор, не оферта, не подпись.')),button(state.signed?'Подтверждено':'Подтвердить в тесте',()=>{if(!state.selected||!state.pd||!state.creditConsent||state.credit!=='review')return;state.signed=true;entry('Демонстрационное подтверждение; юридической силы нет');render();msg('Учебный маршрут пройден.')},true,state.signed,'demoSign'));
 if(state.signed){const d=el('div',undefined,'buttons');[['Запросить новый график','Изменение графика'],['Досрочный выкуп','Досрочный выкуп'],['Страховой случай','Страховой случай']].forEach(([a,b])=>d.append(button(a,()=>{entry('Учебное обращение: '+b);render();msg('Учебное обращение добавлено. Не отправлено брокеру.')})));v.append(d)}
 }
 if(state.step>0)buttons(v,button('← Предыдущий этап',()=>go(state.step-1)));
 msg('Тестовый режим: реальных запросов и решений нет.');
}
$('reset').onclick=reset;render();
