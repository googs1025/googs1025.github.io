export function publishedPosts(posts) {
  return posts
    .filter(({ data }) => !data.draft)
    .sort((left, right) => right.data.pubDate - left.data.pubDate);
}

export function paginatePosts(posts, currentPage, pageSize) {
  if (!Number.isInteger(currentPage) || currentPage < 1) {
    throw new RangeError("currentPage must be a positive integer");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));

  if (currentPage > totalPages) {
    throw new RangeError("currentPage must not exceed totalPages");
  }

  const start = (currentPage - 1) * pageSize;

  return {
    items: posts.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}
