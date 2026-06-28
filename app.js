const input = document.getElementById('input');
const evalBtn = document.getElementById('evalBtn');
const explainBtn = document.getElementById('explainBtn');
const graphBtn = document.getElementById('graphBtn');
const resultEl = document.getElementById('result');
const explanationEl = document.getElementById('explanation');
const historyEl = document.getElementById('history');
const themeToggle = document.getElementById('themeToggle');
const exportCsv = document.getElementById('exportCsv');

let history = JSON.parse(localStorage.getItem('calc_history')||'[]');

function renderHistory(){
  historyEl.innerHTML = '';
  history.slice().reverse().forEach(item=>{
    const li = document.createElement('li');
    li.textContent = item.input + ' = ' + item.result;
    li.style.cursor = 'pointer';
    li.title = 'Click to load into input';
    li.addEventListener('click',()=>{ input.value = item.input; });
    historyEl.appendChild(li);
  });
}

function saveHistory(inputText, resultText){
  history.push({ts:Date.now(),input:inputText,result:resultText});
  localStorage.setItem('calc_history',JSON.stringify(history));
  renderHistory();
}

function showResult(exprTex, resultText){
  resultEl.innerHTML = '';
  if(exprTex){
    try{
      katex.render(exprTex, resultEl, {throwOnError:false});
    }catch(e){
      resultEl.textContent = resultText;
      return;
    }
    const rdiv = document.createElement('div');
    rdiv.style.marginTop = '8px';
    rdiv.style.fontSize = '0.95rem';
    rdiv.textContent = 'Result: ' + resultText;
    resultEl.appendChild(rdiv);
  }else{
    resultEl.textContent = resultText;
  }
}

function evaluateExpression(expr){
  try{
    const r = math.evaluate(expr);
    return r;
  }catch(e){
    // try natural language simple parsing
    const cleaned = expr.replace(/what is|calculate|compute/gi,'');
    try{return math.evaluate(cleaned);}catch(e2){return 'Error: invalid expression';}
  }
}

function buildExpressionSteps(node){
  if(node.isParenthesisNode) return buildExpressionSteps(node.content);
  if(node.isConstantNode) return {text:String(node.value), value:node.value, steps: []};
  if(node.isSymbolNode) return {text: node.name, value:null, steps: []};
  if(node.isOperatorNode){
    const left = buildExpressionSteps(node.args[0]);
    const right = buildExpressionSteps(node.args[1]);
    const op = node.op;
    const exprText = `${left.text} ${op} ${right.text}`;
    const steps = [...left.steps, ...right.steps];
    if(left.value != null && right.value != null){
      const result = math.evaluate(`${left.value} ${op} ${right.value}`);
      steps.push(`${left.value} ${op} ${right.value} = ${result}`);
      return {text:String(result), value:result, steps};
    }
    if(left.value != null || right.value != null){
      return {text:`(${exprText})`, value:null, steps};
    }
    return {text:`(${exprText})`, value:null, steps};
  }
  if(node.isFunctionNode){
    const argSteps = node.args.map(buildExpressionSteps);
    const argText = argSteps.map(a=>a.text).join(', ');
    const steps = argSteps.flatMap(a=>a.steps);
    const fullText = `${node.name}(${argText})`;
    const allValues = argSteps.every(a=>a.value != null);
    if(allValues){
      const result = math.evaluate(fullText);
      steps.push(`${fullText} = ${result}`);
      return {text:String(result), value:result, steps};
    }
    return {text: fullText, value:null, steps};
  }
  return {text: node.toString(), value:null, steps: []};
}

function formatStepsForDisplay(steps, finalAnswer){
  if(!steps || steps.length === 0) return 'No step-by-step details available for this expression.';
  const stepsHtml = '<ol style="margin:0 0 16px 0;padding-left:24px">' + steps.map(step => `<li style="margin:6px 0">${step}</li>`).join('') + '</ol>';
  const finalHtml = finalAnswer !== undefined ? `<div style="padding:12px;background:var(--accent-light);border-radius:8px;color:var(--accent);font-weight:600;margin-top:12px"><strong>Final Answer: ${finalAnswer}</strong></div>` : '';
  return stepsHtml + finalHtml;
}

evalBtn.addEventListener('click',()=>{
  const txt = input.value.trim();
  if(!txt) return;
  const r = evaluateExpression(txt);
  let tex = null;
  try{ tex = math.parse(txt).toTex(); }catch(e){ tex = null; }
  showResult(tex, String(r));
  saveHistory(txt,String(r));
});

explainBtn.addEventListener('click',()=>{
  const txt = input.value.trim();
  if(!txt) return;
  try{
    const node = math.parse(txt);
    const data = buildExpressionSteps(node);
    if(data.steps.length === 0){
      explanationEl.innerHTML = 'Step-by-step not available for this expression.';
    } else {
      explanationEl.innerHTML = formatStepsForDisplay(data.steps, data.value);
    }
  }catch(e){ explanationEl.innerHTML = 'Could not explain expression. Check your syntax.' }
});

graphBtn.addEventListener('click',()=>{
  const txt = input.value.trim();
  if(!txt) return;
  const match = txt.match(/y\s*=\s*(.+)/i);
  const expr = match ? match[1] : txt;
  const fn = x=>{ try{return math.evaluate(expr.replace(/x/g,`(${x})`)); }catch(e){return NaN} }
  const xs = Array.from({length:201},(_,i)=>-10 + i*0.1);
  const ys = xs.map(fn);
  const gd = [{x:xs,y:ys,type:'scatter',mode:'lines'}];
  const el = document.createElement('div'); el.style.height='320px'; el.style.width='100%';
  explanationEl.innerHTML=''; explanationEl.appendChild(el);
  Plotly.newPlot(el,gd,{});
});

themeToggle.addEventListener('click',()=>{
  const cur = document.documentElement.getAttribute('data-theme');
  if(cur === 'dark') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme','dark');
});

exportCsv.addEventListener('click',()=>{
  const rows = [['ts','input','result'],...history.map(h=>[h.ts,h.input,h.result])];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='history.csv'; a.click();
});

renderHistory();
