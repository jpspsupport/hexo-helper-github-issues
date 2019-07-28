'use strict';
const url = require('url');
const fs = require('fs');
const uuidv5 = require('uuid/v5');

function postDetails(option, post){
    let blogUrl = option.url
    const issueUrl = new URL(url.resolve(option.github.url, 'issues/new'));
    if (option.root) {
        blogUrl = url.resolve(blogUrl, option.root);
    }
    const postUrl = url.resolve(blogUrl, post.path);
    const postId = uuidv5(postUrl, uuidv5.URL)
    const title = post.title;
    const sourceFilePath = post.source.replace('_posts/', '');
    const sourcefileName = post.source.replace('_posts/', '');
    const githubBlogMaster = url.resolve(option.github.url, 'blob/master/')
    const githubSourceUrl = url.resolve(githubBlogMaster, sourceFilePath);
    const author = post.author;
    let template;
    try {
        template = fs.readFileSync('./github-issue-template.md', 'utf8');
    } catch (error) {
        console.error(error);
        console.error('Use default template: ');
        template = `
---

#### Document Details

⚠ *Do not edit this section. 

* Article ID: {{ID}}
* 対象記事: [{{TITLE}}]({{PostURL}})
* Content Source: [{{SourceFileName}}]({{SourceFilePath}})
* Author: {{Author}}`;

        console.log(template);
    }
    let documentBody = template.replace('{{TITLE}}', title)
        .replace("{{ID}}", postId)
        .replace('{{SourceFileName}}', sourcefileName)
        .replace('{{SourceFilePath}}', sourceFilePath)
        .replace('{{PostURL}}', postUrl)
        .replace('{{Author}}', author ? author : '')
        .replace('\r\n', '\n');

    issueUrl.searchParams.append('title', '');
    issueUrl.searchParams.append('body', documentBody);
    return {
        postId,
        issueUrl: issueUrl.href,
        sourceUrl: githubSourceUrl
    }
}

function githubDataHelper(config = {}, post = {}) {
    return postDetails(config, post);
}

hexo.extend.helper.register('githubData', githubDataHelper);
