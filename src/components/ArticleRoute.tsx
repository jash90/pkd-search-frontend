import { useParams, Navigate } from 'react-router-dom';
import ArticleLayout from './ArticleLayout';
import { getArticle } from '../content/articles';

const ArticleRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticle(slug);

  if (!article) {
    return <Navigate to="/artykuly" replace />;
  }

  return <ArticleLayout article={article} />;
};

export default ArticleRoute;
