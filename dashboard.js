/* ── DADOS REAIS DO BACKEND ── */
let dashboardData = [];
let lineChart, barHChart, pieChart, barDualChart;

async function carregarDadosDashboard() {
    try {
        const response = await fetch('https://sistema47-back.onrender.com/api/dashboard');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            dashboardData = result.data;
            atualizarKPIs();
            atualizarGraficos();
            atualizarTabela();
        } else {
            console.log('Nenhum dado disponível na API');
            exibirSemDados();
        }
    } catch (erro) {
        console.error('Erro ao carregar dados do dashboard:', erro);
        exibirSemDados();
    }
}

function exibirSemDados() {
    const totalConsumoElem = document.querySelector('.kpi-card.blue .kpi-value');
    const quantidadeTotalElem = document.querySelector('.kpi-card.green .kpi-value');
    const registrosElem = document.querySelector('.kpi-card.orange .kpi-value');
    
    if (totalConsumoElem) totalConsumoElem.innerHTML = 'R$ 0,00';
    if (quantidadeTotalElem) quantidadeTotalElem.innerHTML = '0';
    if (registrosElem) registrosElem.innerHTML = '0';
    
    const alertBanner = document.querySelector('.alert-banner');
    if (alertBanner) alertBanner.style.display = 'none';
    
    const tbody = document.querySelector('.table-card table tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum dado disponível</td></tr>';
    }
    
    criarGraficosVazios();
}

function criarGraficosVazios() {
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Consumo Real (R$)', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', pointRadius: 5, tension: 0.4, fill: true, borderWidth: 2.5 },
            { label: 'Média Histórica (R$)', data: [], borderColor: '#8b5cf6', borderDash: [6, 6], backgroundColor: 'transparent', pointRadius: 5, tension: 0.4, fill: false, borderWidth: 2.5 }
        ]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } } }
    });
    
    if (barHChart) barHChart.destroy();
    barHChart = new Chart(document.getElementById('barHChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Valor (R$)', data: [], backgroundColor: '#22c55e' }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '58%' }
    });
    
    if (barDualChart) barDualChart.destroy();
    barDualChart = new Chart(document.getElementById('barDualChart'), {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Valor (R$)', data: [], backgroundColor: '#3b82f6', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function atualizarKPIs() {
    const anos = [...new Set(dashboardData.map(d => d.exercicio))];
    const anoAtual = Math.max(...anos);
    const dadosAnoAtual = dashboardData.filter(d => d.exercicio === anoAtual);
    
    const totalConsumo = dadosAnoAtual.reduce((sum, d) => sum + d.total_gasto, 0);
    const totalConsumoFormatado = totalConsumo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalRegistros = dadosAnoAtual.length;
    
    const totalConsumoElem = document.querySelector('.kpi-card.blue .kpi-value');
    const quantidadeTotalElem = document.querySelector('.kpi-card.green .kpi-value');
    const registrosElem = document.querySelector('.kpi-card.orange .kpi-value');
    const mesAnoElem = document.querySelector('.kpi-card.blue .kpi-sub');
    
    if (totalConsumoElem) totalConsumoElem.innerHTML = `R$ ${totalConsumoFormatado}`;
    if (quantidadeTotalElem) quantidadeTotalElem.innerHTML = 'N/A';
    if (registrosElem) registrosElem.innerHTML = totalRegistros;
    if (mesAnoElem) mesAnoElem.innerHTML = `Ano: ${anoAtual}`;
    
    const alertasCriticos = dashboardData.filter(d => d.alerta === "CRÍTICO").length;
    const alertBanner = document.querySelector('.alert-banner');
    if (alertBanner && alertasCriticos > 0) {
        alertBanner.style.display = 'flex';
        const alertText = alertBanner.querySelector('.alert-banner-text p');
        if (alertText) {
            alertText.innerHTML = `Existem <b>${alertasCriticos} alerta${alertasCriticos > 1 ? 's' : ''} crítico${alertasCriticos > 1 ? 's' : ''}</b> que requerem atenção imediata.`;
        }
    } else if (alertBanner) {
        alertBanner.style.display = 'none';
    }
    
    const fabBadge = document.getElementById('fabBadge');
    if (fabBadge && alertasCriticos > 0) {
        fabBadge.textContent = alertasCriticos;
        fabBadge.classList.remove('hidden');
    } else if (fabBadge) {
        fabBadge.classList.add('hidden');
    }
}

function atualizarGraficos() {
    const dadosOrdenados = [...dashboardData].sort((a, b) => {
        if (a.exercicio !== b.exercicio) return a.exercicio - b.exercicio;
        return a.periodo - b.periodo;
    });
    
    const labels = dadosOrdenados.map(d => `${d.exercicio}/${d.periodo}`);
    const valoresReais = dadosOrdenados.map(d => d.total_gasto);
    const mediaHistorica = dadosOrdenados.map(d => d.media_histórica || 0);
    
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: { labels, datasets: [
            { label: 'Consumo Real (R$)', data: valoresReais, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', pointBackgroundColor: '#3b82f6', pointRadius: 5, tension: 0.4, fill: true, borderWidth: 2.5 },
            { label: 'Média Histórica (R$)', data: mediaHistorica, borderColor: '#8b5cf6', borderDash: [6, 6], backgroundColor: 'transparent', pointBackgroundColor: '#8b5cf6', pointRadius: 5, tension: 0.4, fill: false, borderWidth: 2.5 }
        ]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } }, scales: { y: { ticks: { callback: v => 'R$ ' + (v >= 1000 ? Math.round(v/1000) + 'k' : v.toFixed(2)) } } } }
    });
    
    const consumoPorAno = {};
    dashboardData.forEach(d => { if (!consumoPorAno[d.exercicio]) consumoPorAno[d.exercicio] = 0; consumoPorAno[d.exercicio] += d.total_gasto; });
    const anos = Object.keys(consumoPorAno).sort();
    const valoresPorAno = anos.map(a => consumoPorAno[a]);
    
    if (barHChart) barHChart.destroy();
    barHChart = new Chart(document.getElementById('barHChart'), {
        type: 'bar',
        data: { labels: anos.map(a => `Ano ${a}`), datasets: [{ label: 'Valor (R$)', data: valoresPorAno, backgroundColor: '#22c55e', borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => 'R$ ' + (v >= 1000 ? Math.round(v/1000) + 'k' : v) } } } }
    });
    
    const alertasCount = {};
    dashboardData.forEach(d => { if (!alertasCount[d.alerta]) alertasCount[d.alerta] = 0; alertasCount[d.alerta]++; });
    const coresAlertas = { 'CRÍTICO': '#ef4444', 'NORMAL': '#22c55e', 'ATENÇÃO': '#f59e0b' };
    
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'doughnut',
        data: { labels: Object.keys(alertasCount), datasets: [{ data: Object.values(alertasCount), backgroundColor: Object.keys(alertasCount).map(k => coresAlertas[k] || '#6b7280'), borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } }, cutout: '58%' }
    });
    
    const periodosUnicos = [...new Set(dashboardData.map(d => `${d.exercicio}-${d.periodo}`))].sort();
    const periodosLabels = periodosUnicos.map(p => { const [ano, periodo] = p.split('-'); return `${ano}/P${periodo}`; });
    const valoresDual = periodosUnicos.map(p => { const [ano, periodo] = p.split('-'); const item = dashboardData.find(d => d.exercicio == ano && d.periodo == periodo); return item ? item.total_gasto : 0; });
    
    if (barDualChart) barDualChart.destroy();
    barDualChart = new Chart(document.getElementById('barDualChart'), {
        type: 'bar',
        data: { labels: periodosLabels, datasets: [{ label: 'Valor (R$)', data: valoresDual, backgroundColor: '#3b82f6', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: 'Valor (R$)' }, ticks: { callback: v => 'R$ ' + (v >= 1000 ? Math.round(v/1000) + 'k' : v) } } } }
    });
}

function atualizarTabela() {
    const tbody = document.querySelector('.table-card table tbody');
    if (!tbody) return;
    
    const dadosOrdenados = [...dashboardData].sort((a, b) => {
        if (a.exercicio !== b.exercicio) return b.exercicio - a.exercicio;
        return a.periodo - b.periodo;
    });
    
    if (dadosOrdenados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum dado disponível</tr>';
        return;
    }
    
    tbody.innerHTML = dadosOrdenados.map(d => {
        const alertaClass = d.alerta === 'CRÍTICO' ? 'var-red' : 'var-green';
        const alertaText = d.alerta === 'CRÍTICO' ? `🔴 ${d.alerta}` : `🟢 ${d.alerta}`;
        return `<tr><td><span class="semana-badge">${d.exercicio}/P${d.periodo}</span></td><td>${d.total_gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td class="val-blue">R$ ${d.total_gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td class="${alertaClass}">${alertaText}</td></tr>`;
    }).join('');
    
    const totalGeral = dashboardData.reduce((sum, d) => sum + d.total_gasto, 0);
    tbody.innerHTML += `<tr style="border-top:2px solid #e5e7eb"><td><strong>TOTAL</strong></td><td><strong>${dashboardData.length} registros</strong></td><td class="val-blue"><strong>R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td><td>—</td></tr>`;
}

// ==========================================
// CÓDIGO DO BOT E POPUP - MANTIDO ORIGINAL
// ==========================================
(function () {
  'use strict';
  
  const fab         = document.getElementById('fabBtn');
  const fabBadge    = document.getElementById('fabBadge');
  const widget      = document.getElementById('chatWidget');
  const closeBtn    = document.getElementById('chatClose');
  const messages    = document.getElementById('chatMessages');
  const input       = document.getElementById('chatInput');
  const sendBtn     = document.getElementById('sendBtn');
  const quickReplies= document.getElementById('quickReplies');
  const initTime    = document.getElementById('initTime');

  let isOpen = false;

  const localResponses = {
    'qual o consumo total': '📊 O consumo total do período atual é de <strong>R$ 1.952.260,00</strong> (55.831 unidades).',
    'mostrar alertas':       '⚠️ Existem <strong>3 alertas ativos</strong>:<br>• Estoque crítico: Material 4<br>• Variação anormal: Semana 5<br>• Pedido pendente: Ref. #2047',
    'top materiais':         '🏆 Top 3 materiais mais consumidos:<br>1. Material 4 – R$ 1.133.370<br>2. Material 7 – R$ 380.920<br>3. Material 2 – R$ 215.440',
    'como cadastrar':        '📋 Para cadastrar um novo material, acesse <strong>Menu → Cadastrar → Novo Material</strong> e preencha o formulário.',
    'consumo':               '📈 O consumo total do período é de R$ 1.952.260,00, com destaque para a Semana 4 (R$ 590.970,00).',
    'materiais':             '📦 Os materiais com maior consumo são: Material 4, Material 7 e Material 2.',
    'cadastrar':             '➕ Na aba <strong>Cadastrar</strong> você consegue registrar materiais, fornecedores e centros de custo.',
    'relatorios':            '📄 Os relatórios podem ser acessados na aba <strong>Relatórios</strong> à esquerda.'
  };

  function getLocalReply(text) { 
    const lower = text.toLowerCase().trim(); 
    for (const [key, val] of Object.entries(localResponses)) { 
      if (lower.includes(key)) return val; 
    } 
    return null;
  }

  function getTime() { 
    const now = new Date(); 
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'); 
  }

  function scrollToBottom() { 
    requestAnimationFrame(() => { 
      messages.scrollTop = messages.scrollHeight; 
    }); 
  }

  function escapeHtml(str) { 
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
  }

  function createBotAvatar() {
    const av = document.createElement('div');
    av.className = 'message__avatar';
    av.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="3" fill="#1565C0"/><circle cx="8.5" cy="14" r="1.5" fill="white"/><circle cx="15.5" cy="14" r="1.5" fill="white"/><rect x="7" y="3" width="2" height="4" rx="1" fill="#1565C0"/><rect x="15" y="3" width="2" height="4" rx="1" fill="#1565C0"/><rect x="9" y="17" width="6" height="1.5" rx="0.75" fill="white"/></svg>`;
    return av;
  }

  function appendUserMessage(text) {
    const wrap = document.createElement('div'); 
    wrap.className = 'message message--user';
    const bubble = document.createElement('div'); 
    bubble.className = 'message__bubble'; 
    bubble.innerHTML = `${escapeHtml(text)}<span class="message__time">${getTime()}</span>`;
    wrap.appendChild(bubble); 
    messages.appendChild(wrap); 
    scrollToBottom();
  }

  function appendTyping() {
    const wrap = document.createElement('div'); 
    wrap.className = 'message typing-indicator'; 
    wrap.id = 'typingIndicator';
    const av = createBotAvatar(); 
    const dots = document.createElement('div'); 
    dots.className = 'typing-dots'; 
    dots.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(av); 
    wrap.appendChild(dots); 
    messages.appendChild(wrap); 
    scrollToBottom(); 
    return wrap;
  }

  function appendBotMessage(html) {
    const wrap = document.createElement('div'); 
    wrap.className = 'message message--bot';
    const av = createBotAvatar(); 
    const bubble = document.createElement('div'); 
    bubble.className = 'message__bubble'; 
    bubble.innerHTML = `${html}<span class="message__time">${getTime()}</span>`;
    wrap.appendChild(av); 
    wrap.appendChild(bubble); 
    messages.appendChild(wrap); 
    scrollToBottom();
  }

  async function enviarMensagem(mensagem) {
    if (!mensagem) return;
    if (quickReplies) quickReplies.style.display = 'none';
    appendUserMessage(mensagem);
    input.value = '';
    const typing = appendTyping();

    try {
      const res = await fetch("https://sistema47-back.onrender.com/api/chatbot/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: mensagem })
      });
      const data = await res.json();
      console.log(data);
      typing.remove();
      if (data) {
        appendBotMessage(data.data.resposta);
      } else {
        appendBotMessage("Desculpe, não consegui processar sua solicitação.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      typing.remove();
      const localReply = getLocalReply(mensagem);
      if (localReply) {
        appendBotMessage(localReply);
      } else {
        appendBotMessage("🤖 Desculpe, não foi possível conectar ao servidor. Por enquanto, você pode usar os botões de exemplo acima!");
      }
    }
  }

  function openWidget() { 
    isOpen = true; 
    widget.classList.add('is-visible'); 
    widget.setAttribute('aria-hidden', 'false'); 
    fab.classList.add('is-open'); 
    if (fabBadge) fabBadge.classList.add('hidden'); 
    setTimeout(() => input.focus(), 100);
  }
  
  function closeWidget() { 
    isOpen = false; 
    widget.classList.remove('is-visible'); 
    widget.setAttribute('aria-hidden', 'true'); 
    fab.classList.remove('is-open'); 
  }
  
  function toggleWidget() { 
    isOpen ? closeWidget() : openWidget(); 
  }

  if (fab) fab.addEventListener('click', toggleWidget);
  if (closeBtn) closeBtn.addEventListener('click', closeWidget);
  if (sendBtn) sendBtn.addEventListener('click', () => enviarMensagem(input.value));
  if (input) input.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      enviarMensagem(input.value); 
    } 
  });

  document.querySelectorAll('.quick-btn').forEach(btn => { 
    btn.addEventListener('click', () => { 
      enviarMensagem(btn.dataset.msg); 
    }); 
  });

  document.addEventListener('click', (e) => { 
    if (isOpen && widget && !widget.contains(e.target) && !fab.contains(e.target)) { 
      closeWidget(); 
    } 
  });
  
  document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape' && isOpen) closeWidget(); 
  });

  if (initTime) initTime.textContent = getTime();
})();

function fecharPopup() {
  const overlay = document.getElementById('popupOverlay');
  if(overlay) overlay.style.display = 'none';
}

// Inicializar dashboard
carregarDadosDashboard();
