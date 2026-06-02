document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DE UPLOAD ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const validCount = document.getElementById('valid-count');
    const warningCount = document.getElementById('warning-count');
    const invalidCount = document.getElementById('invalid-count');
    const dropZoneText = dropZone.querySelector('p');
    const dropZoneSpan = dropZone.querySelector('span');

    // --- ELEMENTOS DE NOTIFICAÇÃO ---
    const panel = document.getElementById('notificationPanel');
    const btnOpen = document.getElementById('openPanel');
    const btnClose = document.getElementById('closePanel');
    const badge = document.getElementById('badgeCount');

    let currentUnread = 6;

    function updateCounter(newCount) {
        currentUnread = newCount;
        if (badge) {
            if (currentUnread > 0) {
                badge.innerText = currentUnread;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        const unreadStrong = document.querySelector('.unread-counter strong');
        if (unreadStrong) unreadStrong.innerText = currentUnread;
    }

    // 1. LÓGICA DE CLIQUE E ARRASTAR ARQUIVO
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#4f46e5';
        dropZone.style.background = '#f5f7ff';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 2. ENVIO PARA O BACKEND (XLSX)
    async function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        
        // Validar extensão
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'xlsx') {
            alert('Por favor, envie apenas arquivos no formato .xlsx');
            return;
        }
        
        dropZoneText.innerText = `Arquivo: ${file.name}`;
        dropZoneSpan.innerText = "Enviando e processando...";
        dropZone.style.pointerEvents = 'none';
        
        // Resetar contadores
        validCount.innerText = '...';
        warningCount.innerText = '...';
        invalidCount.innerText = '...';
        
        const formData = new FormData();
        formData.append('arquivo', file);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
            
            const response = await fetch('https://sistema47-back.onrender.com/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const result = await response.json();
            
            if (result.success) {
                // Atualizar contadores com os dados retornados
                validCount.innerText = result.data.validos || result.data.registros_validos || 0;
                warningCount.innerText = result.data.alertas || result.data.warnings || 0;
                invalidCount.innerText = result.data.invalidos || result.data.erros || 0;
                
                dropZoneSpan.innerText = "✓ Upload concluído!";
                dropZone.style.background = '#f0fdf4';
                dropZone.style.borderColor = '#22c55e';
                
                // Adicionar notificação de sucesso
                adicionarNotificacaoUpload(result);
                
                // Atualizar badge de alertas se houver warnings/erros
                const totalAlertas = (result.data.alertas || 0) + (result.data.invalidos || 0);
                if (totalAlertas > 0) {
                    const novoTotal = currentUnread + totalAlertas;
                    updateCounter(novoTotal);
                    adicionarAlertasDoUpload(result);
                }
            } else {
                throw new Error(result.message || 'Erro no processamento');
            }
            
        } catch (error) {
            console.error('Erro no upload:', error);
            
            if (error.name === 'AbortError') {
                dropZoneSpan.innerText = "⏱ Timeout: O servidor demorou muito para responder";
            } else {
                dropZoneSpan.innerText = "❌ Erro: " + (error.message || 'Falha no upload');
            }
            dropZone.style.background = '#fef2f2';
            dropZone.style.borderColor = '#ef4444';
            validCount.innerText = '0';
            warningCount.innerText = '0';
            invalidCount.innerText = '0';
            
        } finally {
            setTimeout(() => {
                dropZone.style.pointerEvents = 'auto';
                setTimeout(() => {
                    dropZoneSpan.innerText = "Clique para procurar";
                    dropZoneText.innerText = "Arrastar e soltar arquivo XLSX aqui ou ";
                    dropZone.style.background = 'transparent';
                    dropZone.style.borderColor = '#ccc';
                }, 3000);
            }, 1000);
        }
    }
    
    function adicionarNotificacaoUpload(result) {
        const panelContent = document.querySelector('.panel-content');
        if (!panelContent) return;
        
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        
        const validos = result.data.validos || 0;
        const alertas = result.data.alertas || 0;
        const invalidos = result.data.invalidos || 0;
        
        alertItem.innerHTML = `
            <div class="alert-icon-area">
                <i class="fa-solid fa-upload"></i>
            </div>
            <div class="alert-main-content">
                <div class="alert-title-row">
                    <strong>Upload Concluído: ${result.data.arquivo || 'Arquivo'}</strong>
                    <span class="alert-badge critical-badge">NOVO</span>
                </div>
                <p>Processamento finalizado com ${validos} registros válidos, ${alertas} alertas e ${invalidos} inválidos.</p>
                <div class="alert-tags">
                    <span class="tag">✓ Válidos: ${validos}</span>
                    <span class="tag">⚠ Alertas: ${alertas}</span>
                    <span class="tag">✗ Inválidos: ${invalidos}</span>
                </div>
                <div class="alert-actions">
                    <button class="action-btn read"><i class="fa-regular fa-check-circle"></i> Marcar como lido</button>
                    <button class="action-btn dismiss"><i class="fa-regular fa-trash-alt"></i> Dispensar</button>
                </div>
            </div>
        `;
        
        panelContent.insertBefore(alertItem, panelContent.firstChild);
    }
    
    function adicionarAlertasDoUpload(result) {
        const panelContent = document.querySelector('.panel-content');
        if (!panelContent) return;
        
        const erros = result.data.erros_detalhados || [];
        const warnings = result.data.warnings_detalhados || [];
        
        [...erros, ...warnings].slice(0, 5).forEach(alerta => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div class="alert-icon-area">
                    <i class="fa-solid ${alerta.tipo === 'erro' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}"></i>
                </div>
                <div class="alert-main-content">
                    <div class="alert-title-row">
                        <strong>${alerta.mensagem || alerta}</strong>
                        <span class="alert-badge ${alerta.tipo === 'erro' ? 'critical-badge' : ''}">${alerta.tipo?.toUpperCase() || 'ALERTA'}</span>
                    </div>
                    <p>${alerta.detalhe || 'Verifique os dados do arquivo e tente novamente.'}</p>
                    <div class="alert-actions">
                        <button class="action-btn read"><i class="fa-regular fa-check-circle"></i> Marcar como lido</button>
                        <button class="action-btn dismiss"><i class="fa-regular fa-trash-alt"></i> Dispensar</button>
                    </div>
                </div>
            `;
            panelContent.insertBefore(alertItem, panelContent.firstChild);
        });
    }

    // 3. LÓGICA DO PAINEL DE ALERTAS
    if (btnOpen) {
        btnOpen.addEventListener('click', (e) => {
            e.stopPropagation();
            if (panel) panel.style.display = 'block';
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            if (panel) panel.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (panel && panel.style.display === 'block' && 
            !panel.contains(event.target) && 
            btnOpen && !btnOpen.contains(event.target)) {
            panel.style.display = 'none';
        }
    });

    // 4. AÇÕES DENTRO DAS NOTIFICAÇÕES
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
        panelContent.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.closest('.action-btn.read')) {
                const alertItem = target.closest('.alert-item');
                if (alertItem) {
                    updateCounter(Math.max(0, currentUnread - 1));
                    alertItem.remove();
                }
            }
            
            if (target.closest('.action-btn.dismiss')) {
                const alertItem = target.closest('.alert-item');
                if (alertItem) {
                    alertItem.remove();
                }
            }
        });
    }

    // Botão Marcar Todos como Lidos
    const markAllBtn = document.querySelector('.btn-mark-all');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            updateCounter(0);
            const allAlerts = document.querySelectorAll('.alert-item');
            allAlerts.forEach(alert => alert.remove());
        });
    }
    
    // Inicializar contador
    updateCounter(currentUnread);
});