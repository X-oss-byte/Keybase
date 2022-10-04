//
//  AppDelegate.h
//  Keybase
//
//  Created by Chris Nojima on 9/28/16.
//  Copyright © 2016 Keybase. All rights reserved.
//

#import "CocoaLumberjack.h"
#import <React/RCTBridgeDelegate.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
#import <Kb.h>

@class Engine;

@interface AppDelegate : EXAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate, UIDropInteractionDelegate, KbProvider>

@property (nonatomic, strong) UIWindow *window;
@property UIImageView *resignImageView;
@property(nonatomic, strong) NSDictionary *fsPaths;
@end
