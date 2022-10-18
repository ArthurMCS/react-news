/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { RichText } from 'prismic-dom';
import { ReactElement } from 'react';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      dimensions: {
        width: number;
        height: number;
      };
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  return (
    <>
      <Header />
      <main className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner" />
        <section>
          <h1>{post.data.title}</h1>
          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths = async (): Promise<any> => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
    pageSize: 5,
  });

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }): Promise<any> => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
