import { GetStaticProps } from 'next';
import { ReactElement } from 'react';
import { AiOutlineCalendar } from 'react-icons/ai';
import { IoPersonOutline } from 'react-icons/io5';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  id: string;
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const { results } = postsPagination;

  return (
    <>
      <main className={styles.container}>
        <img src="/images/Logo.svg" alt="logo" />

        <section className={styles.previews}>
          {results.map(post => (
            <a key={post.id} href={post.uid}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <AiOutlineCalendar />
                  {post.first_publication_date}
                </time>
                <span>
                  <IoPersonOutline />
                  {post.data.author}
                </span>
              </div>
            </a>
          ))}
        </section>

        <button type="button">Carregar mais posts</button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  const results = postsResponse.results.map(post => ({
    id: post.id,
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(post.data.title),
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
