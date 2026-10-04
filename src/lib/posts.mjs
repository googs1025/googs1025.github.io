export function publishedPosts(posts) {
  return posts
    .filter(({ data }) => !data.draft)
    .sort((left, right) => right.data.pubDate - left.data.pubDate);
}

export function paginatePosts(posts, currentPage, pageSize) {
  const start = (currentPage - 1) * pageSize;

  return {
    items: posts.slice(start, start + pageSize),
    currentPage,
    totalPages: Math.ceil(posts.length / pageSize),
  };
}
