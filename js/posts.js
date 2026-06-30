async function loadPosts() {
  const grid = document.getElementById('post-grid');
  if (!grid) return;

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();

    // Sort by date descending (날짜 누락/오류 시 맨 뒤로)
    posts.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return db - da;
    });

    if (posts.length === 0) {
      grid.innerHTML = '<p class="state-message">아직 작성된 포스트가 없습니다.</p>';
      return;
    }

    grid.innerHTML = posts.map(post => `
      <a href="post.html#posts/${encodeURIComponent(post.file)}" class="post-card">
        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
        ${post.description ? `<p class="post-card-description">${escapeHtml(post.description)}</p>` : ''}
        <div class="post-card-meta">
          <span class="post-card-date">${formatDate(post.date)}</span>
          ${post.tags && post.tags.length ? `
            <div class="post-card-tags">
              ${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </a>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p class="state-message">포스트를 불러오는 중 오류가 발생했습니다.</p>';
    console.error(err);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '날짜 없음';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? '잘못된 날짜' : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadPosts();
