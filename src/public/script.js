document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('downloadForm');
  const urlInput = document.getElementById('urlInput');
  const downloadBtn = document.getElementById('downloadBtn');
  const resultArea = document.getElementById('resultArea');
  const resultContent = document.getElementById('resultContent');
  const errorArea = document.getElementById('errorArea');
  const errorContent = document.getElementById('errorContent');
  const loadingArea = document.getElementById('loadingArea');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) return;

    hideAll();

    downloadBtn.classList.add('loading');
    downloadBtn.disabled = true;
    loadingArea.classList.remove('hidden');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data);
        return;
      }

      showResult(data);
    } catch (err) {
      showError({ error: 'Erro de conexão', details: err.message });
    } finally {
      downloadBtn.classList.remove('loading');
      downloadBtn.disabled = false;
    }
  });

  function showResult(data) {
    loadingArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    errorArea.classList.add('hidden');

    const sizeMB = (data.size / (1024 * 1024)).toFixed(1);

    resultContent.innerHTML = `
      <div class="result-card">
        <div class="icon">✅</div>
        <h3>Download concluído!</h3>
        <span class="platform-tag">${data.platform}</span>
        <div class="file-info">Tamanho: ${sizeMB}MB</div>
        <a href="${data.downloadUrl}" class="download-link" download>
          ⬇️ Baixar vídeo (${sizeMB}MB)
        </a>
      </div>
    `;
  }

  function showError(data) {
    loadingArea.classList.add('hidden');
    errorArea.classList.remove('hidden');
    resultArea.classList.add('hidden');

    const platformMsg = data.platform ? `Plataforma: ${data.platform}` : '';

    errorContent.innerHTML = `
      <div class="error-card">
        <div class="icon">❌</div>
        <h3>Erro ao baixar</h3>
        <p>${data.error || 'Erro desconhecido'}</p>
        ${data.details ? `<p style="margin-top:8px;font-size:12px">${data.details}</p>` : ''}
        ${platformMsg ? `<p style="margin-top:4px;font-size:12px;color:#f7971e">${platformMsg}</p>` : ''}
      </div>
    `;
  }

  function hideAll() {
    resultArea.classList.add('hidden');
    errorArea.classList.add('hidden');
    loadingArea.classList.add('hidden');
  }
});
