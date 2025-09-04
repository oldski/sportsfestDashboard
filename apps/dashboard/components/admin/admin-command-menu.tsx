'use client';

import { useRouter } from 'next/navigation';
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@workspace/ui/components/command';

import { useEnhancedModal } from '~/hooks/use-enhanced-modal';

export type AdminCommandMenuProps = NiceModalHocProps;

const adminNavigationGroups = [
  {
    heading: '',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        description: 'Overview and quick actions'
      },
      {
        title: 'Event Registration',
        href: '/admin/event-registration',
        description: 'Product catalog and registration management'
      },
      {
        title: 'Organizations',
        href: '/admin/organizations',
        description: 'Manage participating companies'
      },
      {
        title: 'Users',
        href: '/admin/users',
        description: 'Global user administration'
      },
      {
        title: 'Reports',
        href: '/admin/reports',
        description: 'Analytics and insights'
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        description: 'System configuration'
      }
    ]
  },
  {
    heading: 'Quick Access',
    items: [
      {
        title: 'Switch to Organizations',
        href: '/organizations',
        description: 'Go to organizations view'
      }
    ]
  }
];

export const AdminCommandMenu = NiceModal.create<AdminCommandMenuProps>(() => {
  const modal = useEnhancedModal();
  const router = useRouter();

  const handleItemSelect = (href: string) => {
    router.push(href);
    modal.hide();
  };

  return (
    <CommandDialog
      open={modal.visible}
      onOpenChange={modal.handleOpenChange}
      className="max-w-lg"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {adminNavigationGroups.map((group) => (
          <CommandGroup
            key={group.heading}
            heading={group.heading}
          >
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.title} ${item.description || ''}`}
                onSelect={() => handleItemSelect(item.href)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
});
