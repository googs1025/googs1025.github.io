export async function assertHtmlFilesOmitTerms(paths, forbiddenTerms, readHtml) {
  for (const path of paths) {
    const html = await readHtml(path);
    const normalizedHtml = html.toLowerCase();

    for (const term of forbiddenTerms) {
      if (normalizedHtml.includes(term.toLowerCase())) {
        throw new Error(`Forbidden term "${term}" found in ${path}`);
      }
    }
  }
}
