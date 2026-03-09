export interface PracticeText {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const practiceTexts: PracticeText[] = [
  {
    id: 'easy-1',
    title: '常用短语一',
    content: '我们是中国人',
    difficulty: 'easy',
  },
  {
    id: 'easy-2',
    title: '常用短语二',
    content: '好好学习天天向上',
    difficulty: 'easy',
  },
  {
    id: 'easy-3',
    title: '常用短语三',
    content: '五笔字型输入法',
    difficulty: 'easy',
  },
  {
    id: 'medium-1',
    title: '古诗一',
    content: '白日依山尽黄河入海流欲穷千里目更上一层楼',
    difficulty: 'medium',
  },
  {
    id: 'medium-2',
    title: '励志名言',
    content: '失败是成功之母',
    difficulty: 'medium',
  },
  {
    id: 'hard-1',
    title: '散文片段',
    content: '燕子去了有再来的时候杨柳枯了有再青的时候桃花谢了有再开的时候',
    difficulty: 'hard',
  },
  {
    id: 'hard-2',
    title: '科技文章',
    content: '人工智能是计算机科学的一个分支它企图了解智能的实质并生产出一种新的能以人类智能相似的方式做出反应的智能机器',
    difficulty: 'hard',
  },
];
