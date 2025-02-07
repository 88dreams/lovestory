import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Button } from '../../../components/common/Button';
import { View } from 'react-native';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};

describe('Button Component', () => {
  // Basic Rendering
  it('renders correctly with default props', () => {
    const { getByText, getByRole } = renderWithTheme(
      <Button onPress={() => {}}>Test Button</Button>
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  // Interaction Tests
  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button onPress={onPress}>Test Button</Button>
    );
    
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('shows loading indicator and hides text', () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <Button onPress={() => {}} loading>
          Test Button
        </Button>
      );
      
      expect(getByTestId('activity-indicator')).toBeTruthy();
      expect(queryByText('Test Button')).toBeNull();
    });

    it('is disabled when loading', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithTheme(
        <Button loading onPress={onPress}>
          Test Button
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(button.props.accessibilityState.busy).toBe(true);
      
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  // Disabled State Tests
  describe('Disabled State', () => {
    it('is non-interactive when disabled', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithTheme(
        <Button disabled onPress={onPress}>
          Test Button
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
      
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  // Variant Tests
  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outlined', 'text'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const { getByRole } = renderWithTheme(
          <Button onPress={() => {}} variant={variant}>
            {variant} Button
          </Button>
        );
        
        const button = getByRole('button');
        expect(button).toBeTruthy();
        // Style checks would be here if we had a way to access computed styles
      });
    });
  });

  // Size Tests
  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const { getByRole } = renderWithTheme(
          <Button onPress={() => {}} size={size}>
            {size} Button
          </Button>
        );
        
        const button = getByRole('button');
        expect(button).toBeTruthy();
        // Style checks would be here if we had a way to access computed styles
      });
    });
  });

  // Icon Tests
  describe('Icon Support', () => {
    it('renders with an icon', () => {
      const testIcon = <View testID="test-icon" />;
      const { getByTestId, getByText } = renderWithTheme(
        <Button onPress={() => {}} icon={testIcon}>
          Icon Button
        </Button>
      );
      
      expect(getByTestId('test-icon')).toBeTruthy();
      expect(getByText('Icon Button')).toBeTruthy();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('supports custom accessibility props', () => {
      const { getByRole } = renderWithTheme(
        <Button 
          onPress={() => {}}
          accessibilityLabel="Custom Label"
          accessibilityHint="Custom Hint"
        >
          Test Button
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Custom Label');
      expect(button.props.accessibilityHint).toBe('Custom Hint');
    });

    it('uses text as accessibility label when not provided', () => {
      const { getByRole } = renderWithTheme(
        <Button onPress={() => {}}>
          Test Button
        </Button>
      );
      
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Test Button');
    });
  });

  // Style Override Tests
  describe('Style Customization', () => {
    it('accepts custom style props', () => {
      const customStyle = { backgroundColor: 'red' };
      const customLabelStyle = { color: 'white' };
      
      const { getByRole, getByText } = renderWithTheme(
        <Button 
          onPress={() => {}}
          style={customStyle}
          labelStyle={customLabelStyle}
        >
          Custom Style
        </Button>
      );
      
      expect(getByRole('button')).toBeTruthy();
      expect(getByText('Custom Style')).toBeTruthy();
      // Style checks would be here if we had a way to access computed styles
    });
  });
}); 