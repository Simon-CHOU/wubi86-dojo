/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { customRender as render };
