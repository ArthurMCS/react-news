/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { ReactElement, useMemo } from 'react';
import { AiOutlineCalendar } from 'react-icons/ai';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { IoPersonOutline } from 'react-icons/io5';
import { FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
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

interface GetStaticPathsReturn {
  paths: {
    params: {
      slug: string;
    };
  }[];
  fallback: boolean;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  const readTime = useMemo(() => {
    let wordCount = 0;

    post.data.content.forEach(content => {
      content.body.forEach(body => {
        wordCount += body.text?.split(' ').length;
      });
    });

    return Math.ceil(wordCount / 200);
  }, [post.data.content]);

  if (router.isFallback) return <div>Carregando...</div>;

  return (
    <>
      <Header />
      <main className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner" />
        <section>
          <h1>{post.data.title}</h1>

          <div className={styles.detailsContainer}>
            <time>
              <AiOutlineCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <IoPersonOutline />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {readTime} min
            </span>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <div key={Math.random()}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths =
  async (): Promise<GetStaticPathsReturn> => {
    const prismic = getPrismicClient({});
    const posts = await prismic.getByType('posts', {
      lang: 'pt-BR',
      pageSize: 5,
    });

    return {
      paths: posts.results.map(post => ({
        params: {
          slug: post.uid,
        },
      })),
      fallback: true,
    };
  };

export const getStaticProps: GetStaticProps = async ({
  params,
}): Promise<any> => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
