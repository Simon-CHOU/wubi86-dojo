import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { cn } from '../lib/utils';

const ONBOARDING_KEY = 'wubi86-dojo-onboarding-dismissed';

const steps = [
  {
    title: '测试你的双拼速度',
    description:
      '首先完成基线测试，了解你当前的双拼输入速度。我们将以此为基准，为你制定个性化的30天五笔学习计划。',
    icon: '🚀',
  },
  {
    title: '每日练习五笔',
    description:
      '每天进行五笔86编码练习，每字下方会显示对应的五笔编码。从简单到困难，循序渐进地提升你的打字速度和准确率。',
    icon: '⌨️',
  },
  {
    title: '追踪你的进步',
    description:
      '通过统计页面查看你的每日进步曲线。对比目标速度和实际表现，30天后你将看到从双拼到五笔的显著提升。',
    icon: '📈',
  },
];

const OnboardingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleClose = () => {
    // When user closes without completing, still mark as dismissed
    handleDismiss();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="欢迎使用五笔86特训营"
      footer={
        <>
          <div className="flex items-center gap-2 mr-auto">
            {steps.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  index === currentStep
                    ? 'bg-emerald-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          {currentStep > 0 && (
            <Button variant="ghost" onClick={handlePrev}>
              上一步
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            aria-label={currentStep === steps.length - 1 ? '开始使用' : '下一步'}
          >
            {currentStep === steps.length - 1 ? '开始使用' : '下一步'}
          </Button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="text-5xl mb-4" aria-hidden="true">
          {step.icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {step.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          {step.description}
        </p>
      </div>
    </Modal>
  );
};

export default OnboardingGuide;
