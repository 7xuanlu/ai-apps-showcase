'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import AuthButtons from './AuthButtons'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Showcase', href: '/demos' },
  { name: 'Auth Demo', href: '/demo-auth' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-white relative z-20 w-full">
      {({ open }) => (
        <>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center w-full">
              {/* Logo/Brand */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  AI Portfolio
                </Link>
              </div>
              
              {/* Right side: Navigation links + Auth buttons */}
              <div className="hidden md:flex md:items-center md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'border-sky-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'inline-flex items-center border-b-2 px-1 pt-1 text-md font-medium transition-colors'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Auth buttons right next to navigation */}
                <div className="ml-8">
                  <AuthButtons />
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile menu overlay */}
          <DisclosurePanel className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="relative h-full">
              {/* Close button in top right */}
              <div className="absolute top-4 right-4 z-10">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close main menu</span>
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                </DisclosureButton>
              </div>
              
              <div className="flex flex-col h-full pt-20 px-4">
                <div className="space-y-1 flex-1">
                  {navigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'bg-sky-50 border-sky-500 text-sky-700'
                          : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                        'block border-l-4 py-3 pl-3 pr-4 text-lg font-medium transition-colors w-full'
                      )}
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
                
                {/* Mobile auth buttons at bottom */}
                <div className="pb-8 border-t border-gray-200 pt-4">
                  <div className="flex items-center w-full">
                    <AuthButtons />
                  </div>
                </div>
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
