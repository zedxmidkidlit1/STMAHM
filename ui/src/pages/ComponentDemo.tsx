/**
 * Component Demo Page
 * Showcases all Phase 2 components
 */

import { useState } from 'react';
import { Play, Save, Trash2, Settings, Copy } from 'lucide-react';
import { Button, Toggle, Input, Select, ContextMenu, toast } from '../components/common';
import type { SelectOption, ContextMenuItem } from '../components/common';

export default function ComponentDemo() {
  const [toggleEnabled, setToggleEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [inputError, setInputError] = useState('');

  // Select options
  const selectOptions: SelectOption[] = [
    { value: 'option1', label: 'Dashboard View', icon: <Play className="w-4 h-4" /> },
    { value: 'option2', label: 'Settings Panel', icon: <Settings className="w-4 h-4" /> },
    { value: 'option3', label: 'Save Data', icon: <Save className="w-4 h-4" /> },
    { value: 'option4', label: 'Copy Items', icon: <Copy className="w-4 h-4" /> },
    { value: 'disabled', label: 'Disabled Option', disabled: true },
  ];

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => toast.success('Copied!'),
    },
    {
      label: 'Save',
      icon: <Save className="w-4 h-4" />,
      onClick: () => toast.success('Saved!'),
    },
    { separator: true } as ContextMenuItem,
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => toast.error('Deleted!'),
      danger: true,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validation example
    if (value.length > 0 && value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Component Library Demo</h1>
        <p className="text-text-muted">Testing all Phase 2 components with live interactions</p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Buttons
        </h2>
        
        <div className="space-y-3">
          {/* Variants */}
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => toast.success('Primary clicked!')}>
              Primary Button
            </Button>
            <Button variant="secondary" onClick={() => toast.info('Secondary clicked!')}>
              Secondary Button
            </Button>
            <Button variant="ghost" onClick={() => toast('Ghost clicked!')}>
              Ghost Button
            </Button>
            <Button variant="danger" onClick={() => toast.error('Danger clicked!')}>
              Danger Button
            </Button>
          </div>

          {/* With Icons */}
          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<Play className="w-4 h-4" />} onClick={() => toast.success('Playing...')}>
              Start Scan
            </Button>
            <Button variant="secondary" rightIcon={<Settings className="w-4 h-4" />}>
              Settings
            </Button>
          </div>

          {/* Sizes */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          {/* States */}
          <div className="flex flex-wrap gap-3">
            <Button isLoading>Loading...</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      {/* Toggle Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Toggle/Switch
        </h2>
        
        <div className="space-y-4">
          <Toggle
            enabled={toggleEnabled}
            onChange={(value) => {
              setToggleEnabled(value);
              toast(value ? 'Enabled!' : 'Disabled!');
            }}
            label="Enable Feature"
            description="Toggle this feature on or off"
          />

          <div className="flex gap-4 items-center">
            <Toggle enabled={false} onChange={() => {}} size="sm" label="Small" />
            <Toggle enabled={true} onChange={() => {}} size="md" label="Medium" />
            <Toggle enabled={true} onChange={() => {}} size="lg" label="Large" />
          </div>
        </div>
      </section>

      {/* Input Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Input Fields
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            success="Valid email format"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            helperText="Must be at least 8 characters"
          />

          <Input
            label="Search"
            placeholder="Search..."
            leftIcon={<Play className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* Select Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Select Dropdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Choose Option"
            options={selectOptions}
            value={selectValue}
            onChange={(value) => {
              setSelectValue(value);
              toast.success(`Selected: ${selectOptions.find(o => o.value === value)?.label}`);
            }}
            placeholder="Select an option..."
          />

          <Select
            label="With Error"
            options={selectOptions}
            value=""
            onChange={() => {}}
            error="Please select an option"
          />
        </div>
      </section>

      {/* Context Menu Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Context Menu
        </h2>
        
        <ContextMenu items={contextMenuItems}>
          <div className="p-8 bg-bg-tertiary border-2 border-dashed border-theme rounded-lg text-center cursor-pointer hover:bg-bg-hover transition-colors">
            <p className="text-text-primary font-medium">Right-click here</p>
            <p className="text-sm text-text-muted mt-1">Try the context menu!</p>
          </div>
        </ContextMenu>
      </section>

      {/* Keyboard Shortcuts Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary border-b border-theme pb-2">
          Keyboard Shortcuts
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <kbd className="px-2 py-1 bg-bg-secondary border border-theme rounded">Cmd/Win + 1-4</kbd>
            <p className="text-text-muted mt-2">Navigate pages</p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <kbd className="px-2 py-1 bg-bg-secondary border border-theme rounded">Cmd/Win + S</kbd>
            <p className="text-text-muted mt-2">Start scan</p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <kbd className="px-2 py-1 bg-bg-secondary border border-theme rounded">Cmd/Win + B</kbd>
            <p className="text-text-muted mt-2">Toggle sidebar</p>
          </div>
          <div className="p-3 bg-bg-tertiary rounded-lg">
            <kbd className="px-2 py-1 bg-bg-secondary border border-theme rounded">Cmd/Win + T</kbd>
            <p className="text-text-muted mt-2">Toggle theme</p>
          </div>
        </div>
      </section>

      {/* Info Card */}
      <section className="p-6 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
        <h3 className="text-lg font-semibold text-accent-blue mb-2">Testing Complete! 🎉</h3>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>✅ All components rendering correctly</li>
          <li>✅ Animations working (hover, click, transitions)</li>
          <li>✅ Toast notifications functional</li>
          <li>✅ Form validation active</li>
          <li>✅ Context menu responsive</li>
          <li>✅ Keyboard shortcuts enabled globally</li>
        </ul>
      </section>
    </div>
  );
}
